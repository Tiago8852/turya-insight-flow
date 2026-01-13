import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X, AlertCircle, Download, ExternalLink, RotateCcw, Loader2, CheckCircle } from "lucide-react";

const UploadZone = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);

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

  const handleReset = () => {
    setFiles([]);
    setError(null);
    setIsSuccess(false);
    setDownloadUrl(null);
    setHtmlContent(null);
    // Revoke the blob URL to free memory
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }
  };

  const handleViewOnline = () => {
    if (htmlContent) {
      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (files.length === 0) {
      setError("Selecione pelo menos um arquivo");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();

    files.forEach((file, index) => {
      formData.append(`arquivo_${index}`, file);
    });

    formData.append("session_id", crypto.randomUUID());
    formData.append("timestamp", new Date().toISOString());
    formData.append("quantidade_arquivos", files.length.toString());

    console.log(">>> ENVIANDO PARA N8N <<<");

    try {
      const response = await fetch(
        "https://corsproxy.io/?" + encodeURIComponent("https://wgatech.app.n8n.cloud/webhook/deo-analise"),
        {
          method: "POST",
          body: formData,
        }
      );

      console.log("Response status:", response.status);

      if (response.ok) {
        const resultado = await response.json();
        
        if (resultado.success && resultado.html) {
          // Cria arquivo para download
          const blob = new Blob([resultado.html], { type: "text/html" });
          const url = URL.createObjectURL(blob);
          setDownloadUrl(url);
          setHtmlContent(resultado.html);
          setIsSuccess(true);
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          throw new Error("Erro no processamento: resposta inválida");
        }
      } else {
        throw new Error(`Erro ${response.status}`);
      }
    } catch (err: unknown) {
      console.error("Erro no fetch:", err);
      const message = err instanceof Error ? err.message : "Erro ao enviar";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading State
  if (isSubmitting) {
    return (
      <section id="upload" className="py-24 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
          >
            <div className="card-elevated p-12 md:p-16 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-primary/20 flex items-center justify-center"
              >
                <Loader2 className="w-12 h-12 text-primary" />
              </motion.div>

              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Analisando suas <span className="text-gradient">cotações...</span>
              </h3>

              <p className="text-muted-foreground mb-8">
                Isso pode levar alguns minutos. Por favor, aguarde.
              </p>

              <div className="flex justify-center gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 rounded-full bg-primary"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  // Success State
  if (isSuccess && downloadUrl) {
    return (
      <section id="upload" className="py-24 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
          >
            <div className="card-elevated p-8 md:p-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-green-500/20 flex items-center justify-center"
              >
                <CheckCircle className="w-12 h-12 text-green-400" />
              </motion.div>

              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl md:text-3xl font-bold mb-4"
              >
                Sua análise está <span className="text-gradient">pronta!</span>
              </motion.h3>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground mb-8"
              >
                Clique abaixo para baixar ou visualizar o relatório.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
              >
                <a
                  href={downloadUrl}
                  download="Analise_DO.html"
                  className="btn-turya text-foreground px-8 inline-flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Baixar Relatório
                </a>

                <button
                  onClick={handleViewOnline}
                  className="px-8 py-3 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 transition-all inline-flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  Visualizar Online
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Enviar outras cotações
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  // Default Upload State
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
              Faça upload dos PDFs para receber a análise instantânea
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Upload Zone */}
            <motion.div
              className={`upload-zone p-12 text-center cursor-pointer transition-all ${
                isDragging ? "active scale-[1.02]" : ""
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-input")?.click()}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <input
                id="file-input"
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileInput}
                className="hidden"
              />

              <motion.div
                className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-primary flex items-center justify-center"
                animate={isDragging ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.5, repeat: isDragging ? Infinity : 0 }}
              >
                <Upload className="w-10 h-10 text-foreground" />
              </motion.div>

              <p className="text-lg font-medium mb-2">Arraste suas cotações aqui</p>
              <p className="text-sm text-muted-foreground">ou clique para selecionar arquivos</p>
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
                          <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
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
                type="submit"
                disabled={files.length === 0}
                className="btn-turya text-foreground px-12 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                Analisar {files.length > 0 ? files.length : ""} {files.length === 1 ? "Cotação" : "Cotações"}
              </button>
              {files.length === 0 && (
                <p className="text-xs text-muted-foreground mt-3">Selecione pelo menos 1 arquivo PDF</p>
              )}
            </motion.div>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default UploadZone;
