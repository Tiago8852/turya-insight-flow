import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X, AlertCircle, Mail } from "lucide-react";
import { z } from "zod";

interface UploadZoneProps {
  onSuccess: (email: string, fileCount: number) => void;
}

const emailSchema = z.string().trim().email({ message: "Email inválido" });

const UploadZone = ({ onSuccess }: UploadZoneProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateFile = (file: File): string | null => {
    if (file.type !== "application/pdf") {
      return "Apenas arquivos PDF são aceitos";
    }
    if (file.size > 10 * 1024 * 1024) {
      return "Arquivo muito grande. Máximo 10MB";
    }
    return null;
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      setError(null);

      const droppedFiles = Array.from(e.dataTransfer.files);
      
      if (files.length + droppedFiles.length > 10) {
        setError("Máximo de 10 arquivos permitidos");
        return;
      }

      const validFiles: File[] = [];
      for (const file of droppedFiles) {
        const fileError = validateFile(file);
        if (fileError) {
          setError(fileError);
          return;
        }
        validFiles.push(file);
      }
      
      setFiles([...files, ...validFiles]);
    },
    [files]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      
      if (files.length + selectedFiles.length > 10) {
        setError("Máximo de 10 arquivos permitidos");
        return;
      }

      const validFiles: File[] = [];
      for (const file of selectedFiles) {
        const fileError = validateFile(file);
        if (fileError) {
          setError(fileError);
          return;
        }
        validFiles.push(file);
      }
      
      setFiles([...files, ...validFiles]);
    }
    // Reset input
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const validateEmail = (): boolean => {
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setEmailError(result.error.errors[0].message);
      return false;
    }
    setEmailError(null);
    return true;
  };

  const handleSubmit = async () => {
    // Validate email
    if (!validateEmail()) return;
    
    // Validate files
    if (files.length === 0) {
      setError("Selecione pelo menos 1 arquivo PDF");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      
      // Add files
      files.forEach((file, index) => {
        formData.append(`arquivo_${index}`, file);
      });
      
      // Add metadata
      formData.append("email", email.trim());
      formData.append("session_id", crypto.randomUUID());
      formData.append("timestamp", new Date().toISOString());
      formData.append("quantidade_arquivos", files.length.toString());

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/enviar-cotacoes`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        onSuccess(email, files.length);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err) {
      console.error("Erro ao enviar:", err);
      setError("Erro ao enviar cotações. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="upload" className="py-24 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Envie suas <span className="text-gradient">Cotações</span>
            </h2>
            <p className="text-muted-foreground">
              Preencha seu email e faça upload dos PDFs para receber a análise
            </p>
          </div>

          {/* Email Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <label htmlFor="email" className="block text-sm font-medium mb-2 text-muted-foreground">
              Seu email para receber o relatório
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                onBlur={validateEmail}
                placeholder="seu@email.com"
                disabled={isSubmitting}
                className={`w-full pl-12 pr-4 py-4 rounded-xl bg-card border transition-all outline-none ${
                  emailError 
                    ? "border-destructive focus:border-destructive" 
                    : "border-border focus:border-primary"
                } disabled:opacity-60`}
              />
            </div>
            {emailError && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-destructive mt-2 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                {emailError}
              </motion.p>
            )}
          </motion.div>

          {/* Upload Zone */}
          <motion.div
            className={`upload-zone p-12 text-center cursor-pointer transition-all ${
              isDragging ? "active scale-[1.02]" : ""
            } ${isSubmitting ? "pointer-events-none opacity-60" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-input")?.click()}
            whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.99 }}
          >
            <input
              id="file-input"
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileInput}
              className="hidden"
              disabled={isSubmitting}
            />

            <motion.div
              className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-primary flex items-center justify-center"
              animate={isDragging ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5, repeat: isDragging ? Infinity : 0 }}
            >
              <Upload className="w-10 h-10 text-foreground" />
            </motion.div>

            <p className="text-lg font-medium mb-2">
              Arraste suas cotações aqui
            </p>
            <p className="text-sm text-muted-foreground">
              ou clique para selecionar arquivos
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              Arquivos PDF • Máximo 10MB cada • Até 10 arquivos
            </p>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/30 flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                <span className="text-sm text-destructive">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* File List */}
          <AnimatePresence>
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-8 space-y-3"
              >
                {files.map((file, index) => (
                  <motion.div
                    key={`${file.name}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="card-elevated p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm truncate max-w-[200px] md:max-w-[400px]">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                      disabled={isSubmitting}
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-8 text-center"
          >
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || files.length === 0 || !email}
              className="btn-turya text-foreground px-12 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Enviando...
                </span>
              ) : (
                `Analisar ${files.length > 0 ? files.length : ""} ${files.length === 1 ? "Cotação" : "Cotações"}`
              )}
            </button>
            {files.length === 0 && (
              <p className="text-xs text-muted-foreground mt-3">
                Selecione pelo menos 1 arquivo PDF
              </p>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default UploadZone;
