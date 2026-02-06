import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  X,
  AlertCircle,
  Send,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadZoneProps {
  onSuccess: (htmlBlob: Blob) => void;
  onError: (message: string) => void;
  onStartProcessing: () => void;
}

const MAX_FILES = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ["application/pdf"];
const N8N_URL = "https://wgatech.app.n8n.cloud/webhook/e318c85e-0e6d-46a9-8205-9938e16895c2";
const WEBHOOK_URL = "https://corsproxy.io/?" + encodeURIComponent(N8N_URL);
const TIMEOUT_MS = 10 * 60 * 1000; // 10 minutos (n8n pode demorar)

const UploadZone = ({ onSuccess, onError, onStartProcessing }: UploadZoneProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return `${file.name}: Apenas arquivos PDF são aceitos`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name}: Arquivo muito grande (máx. 10MB)`;
    }
    return null;
  };

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const filesArray = Array.from(newFiles);
      const validFiles: File[] = [];
      const errors: string[] = [];

      for (const file of filesArray) {
        const fileError = validateFile(file);
        if (fileError) {
          errors.push(fileError);
        } else if (files.length + validFiles.length >= MAX_FILES) {
          errors.push(`Máximo de ${MAX_FILES} arquivos permitido`);
          break;
        } else if (
          !files.some((f) => f.name === file.name && f.size === file.size)
        ) {
          validFiles.push(file);
        }
      }

      if (errors.length > 0) {
        setError(errors.join(". "));
      } else {
        setError(null);
      }

      if (validFiles.length > 0) {
        setFiles((prev) => [...prev, ...validFiles]);
      }
    },
    [files]
  );

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setError(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (files.length === 0) {
      setError("Selecione pelo menos um arquivo");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    onStartProcessing();

    const sessionId = crypto.randomUUID();
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file);
    });

    formData.append("session_id", sessionId);
    formData.append("timestamp", new Date().toISOString());
    formData.append("quantidade_arquivos", files.length.toString());

    console.log(">>> ENVIANDO PARA N8N <<<");
    console.log("Session ID:", sessionId);

    try {
      // Criar AbortController para timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log("Response status:", response.status);
      console.log("Content-Type:", response.headers.get("content-type"));

      if (!response.ok) {
        throw new Error(`Erro do servidor: ${response.status}`);
      }

      // Receber o arquivo HTML como blob
      const blob = await response.blob();
      console.log("Blob recebido:", blob.size, "bytes, tipo:", blob.type);

      if (blob.size === 0) {
        throw new Error("Resposta vazia do servidor");
      }

      // Sucesso - enviar blob para o componente pai
      onSuccess(blob);
    } catch (err: unknown) {
      console.error("Erro no envio:", err);
      
      let message = "Erro ao processar análise";
      
      if (err instanceof Error) {
        if (err.name === "AbortError") {
          message = "Tempo limite excedido (5 minutos). Por favor, tente novamente.";
        } else {
          message = err.message;
        }
      }
      
      setError(message);
      onError(message);
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <section id="upload-section" className="py-16">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <form onSubmit={handleSubmit}>
            <div className="card-elevated p-8 md:p-10">
              <h2 className="text-2xl font-bold text-center mb-2">
                Envie suas cotações
              </h2>
              <p className="text-muted-foreground text-center mb-8">
                Faça upload dos PDFs das cotações D&O para análise comparativa
              </p>

              {/* Drop Zone */}
              <div
                onClick={openFileDialog}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-8 md:p-12 text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-primary bg-primary/10"
                    : "border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <motion.div
                  animate={{ scale: isDragging ? 1.1 : 1 }}
                  className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/20 flex items-center justify-center"
                >
                  <Upload className="w-8 h-8 text-primary" />
                </motion.div>

                <p className="text-lg font-medium mb-2">
                  Arraste e solte seus arquivos aqui
                </p>
                <p className="text-muted-foreground text-sm">
                  ou clique para selecionar
                </p>
                <p className="text-muted-foreground/70 text-xs mt-2">
                  PDF • Máx. 10MB por arquivo • Até {MAX_FILES} arquivos
                </p>
              </div>

              {/* File List */}
              <AnimatePresence>
                {files.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 space-y-3"
                  >
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        {files.length}{" "}
                        {files.length === 1 ? "arquivo" : "arquivos"}{" "}
                        selecionado{files.length !== 1 ? "s" : ""}
                      </span>
                      <button
                        type="button"
                        onClick={() => setFiles([])}
                        className="text-destructive hover:underline"
                      >
                        Remover todos
                      </button>
                    </div>

                    {files.map((file, index) => (
                      <motion.div
                        key={`${file.name}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="w-8 h-8 rounded-lg hover:bg-destructive/20 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-destructive"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <div className="mt-8">
                <Button
                  type="submit"
                  size="lg"
                  disabled={files.length === 0 || isSubmitting}
                  className="w-full gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Analisar Cotações
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default UploadZone;
