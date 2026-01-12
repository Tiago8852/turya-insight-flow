import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X, AlertCircle } from "lucide-react";

interface UploadZoneProps {
  files: File[];
  setFiles: (files: File[]) => void;
  onSubmit: () => void;
  isProcessing: boolean;
}

const UploadZone = ({ files, setFiles, onSubmit, isProcessing }: UploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    if (file.type !== "application/pdf") {
      setError("Apenas arquivos PDF são aceitos");
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Arquivo muito grande. Máximo 10MB");
      return false;
    }
    return true;
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      setError(null);

      const droppedFiles = Array.from(e.dataTransfer.files);
      const validFiles = droppedFiles.filter(validateFile);
      setFiles([...files, ...validFiles]);
    },
    [files, setFiles]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = selectedFiles.filter(validateFile);
      setFiles([...files, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
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
              Arraste seus arquivos PDF ou clique para selecionar
            </p>
          </div>

          <motion.div
            className={`upload-zone p-12 text-center cursor-pointer transition-all ${
              isDragging ? "active scale-[1.02]" : ""
            } ${isProcessing ? "pointer-events-none opacity-60" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-input")?.click()}
            whileHover={{ scale: isProcessing ? 1 : 1.01 }}
            whileTap={{ scale: isProcessing ? 1 : 0.99 }}
          >
            <input
              id="file-input"
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileInput}
              className="hidden"
              disabled={isProcessing}
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
              Arquivos PDF • Máximo 10MB cada
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
                <AlertCircle className="w-5 h-5 text-destructive" />
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
                    transition={{ delay: index * 0.1 }}
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
                      disabled={isProcessing}
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <AnimatePresence>
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mt-8 text-center"
              >
                <button
                  onClick={onSubmit}
                  disabled={isProcessing}
                  className="btn-turya text-foreground px-12 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Enviando...
                    </span>
                  ) : (
                    `Enviar ${files.length} ${files.length === 1 ? "Cotação" : "Cotações"}`
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default UploadZone;
