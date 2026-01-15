import { motion } from "framer-motion";
import { Upload, Brain, FileText, CheckCircle, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

type ProcessingStage = "uploading" | "processing" | "generating" | "completed";

interface ProcessingStatusProps {
  stage: ProcessingStage;
  progress: number;
}

const stages = [
  { id: "uploading", label: "Enviando arquivos...", icon: Upload },
  { id: "processing", label: "Processando com IA...", icon: Brain },
  { id: "generating", label: "Gerando relatório...", icon: FileText },
  { id: "completed", label: "Concluído!", icon: CheckCircle },
];

const ProcessingStatus = ({ stage, progress }: ProcessingStatusProps) => {
  const currentIndex = stages.findIndex((s) => s.id === stage);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-6">
        <Progress value={progress} className="h-2" />
        <p className="text-center text-sm text-muted-foreground mt-2">
          {progress}%
        </p>
      </div>

      <div className="space-y-4">
        {stages.map((s, index) => {
          const Icon = s.icon;
          const isActive = s.id === stage;
          const isCompleted = index < currentIndex;
          const isPending = index > currentIndex;

          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                isActive
                  ? "bg-primary/20 border border-primary/40"
                  : isCompleted
                  ? "bg-green-500/10 border border-green-500/30"
                  : "bg-muted/30 border border-transparent opacity-50"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isCompleted
                    ? "bg-green-500 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isActive && stage !== "completed" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span
                className={`font-medium ${
                  isActive
                    ? "text-foreground"
                    : isCompleted
                    ? "text-green-400"
                    : "text-muted-foreground"
                }`}
              >
                {s.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ProcessingStatus;
