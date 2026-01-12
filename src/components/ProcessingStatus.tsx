import { motion } from "framer-motion";
import { Upload, Brain, FileText, CheckCircle, Loader2 } from "lucide-react";

export type ProcessingStep = "uploading" | "processing" | "generating" | "completed";

interface ProcessingStatusProps {
  currentStep: ProcessingStep;
}

const steps = [
  {
    id: "uploading",
    label: "Enviando arquivos...",
    icon: Upload,
  },
  {
    id: "processing",
    label: "Processando com IA...",
    icon: Brain,
  },
  {
    id: "generating",
    label: "Gerando relatório...",
    icon: FileText,
  },
  {
    id: "completed",
    label: "Concluído!",
    icon: CheckCircle,
  },
];

const ProcessingStatus = ({ currentStep }: ProcessingStatusProps) => {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto card-elevated p-8 md:p-12"
        >
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold mb-2">
              {currentStep === "completed" ? (
                <span className="text-gradient">Análise Concluída!</span>
              ) : (
                "Analisando suas cotações..."
              )}
            </h3>
            <p className="text-muted-foreground text-sm">
              {currentStep === "completed"
                ? "Seu relatório está pronto para download"
                : "Isso pode levar alguns segundos"}
            </p>
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentIndex;
              const isCompleted = index < currentIndex;
              const isPending = index > currentIndex;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                    isActive
                      ? "bg-primary/10 border border-primary/30"
                      : isCompleted
                      ? "bg-muted/30"
                      : "opacity-40"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                      isActive
                        ? "bg-gradient-primary animate-pulse-glow"
                        : isCompleted
                        ? "bg-green-500/20"
                        : "bg-muted"
                    }`}
                  >
                    {isActive && step.id !== "completed" ? (
                      <Loader2 className="w-6 h-6 text-foreground animate-spin" />
                    ) : isCompleted || step.id === "completed" && isActive ? (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    ) : (
                      <Icon className={`w-6 h-6 ${isPending ? "text-muted-foreground" : "text-foreground"}`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        isActive
                          ? "text-foreground"
                          : isCompleted
                          ? "text-muted-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                  {isCompleted && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center"
                    >
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="mt-8">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-primary"
                initial={{ width: "0%" }}
                animate={{
                  width:
                    currentStep === "uploading"
                      ? "25%"
                      : currentStep === "processing"
                      ? "50%"
                      : currentStep === "generating"
                      ? "75%"
                      : "100%",
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProcessingStatus;
