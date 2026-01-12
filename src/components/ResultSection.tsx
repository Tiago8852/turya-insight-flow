import { motion } from "framer-motion";
import { Download, ExternalLink, FileCheck, Clock } from "lucide-react";

interface ResultSectionProps {
  reportUrl?: string;
  timestamp: Date;
  onReset: () => void;
}

const ResultSection = ({ reportUrl, timestamp, onReset }: ResultSectionProps) => {
  const formatTimestamp = (date: Date) => {
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="card-elevated p-8 md:p-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-primary flex items-center justify-center glow-orange"
            >
              <FileCheck className="w-12 h-12 text-foreground" />
            </motion.div>

            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold mb-4"
            >
              Sua análise está{" "}
              <span className="text-gradient">pronta!</span>
            </motion.h3>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-2 text-muted-foreground mb-8"
            >
              <Clock className="w-4 h-4" />
              <span className="text-sm">Gerado em {formatTimestamp(timestamp)}</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <a
                href={reportUrl || "#"}
                download="relatorio-dno-turya.html"
                className="btn-turya inline-flex items-center gap-3 text-foreground w-full sm:w-auto justify-center"
              >
                <Download className="w-5 h-5" />
                Baixar Relatório
              </a>
              <a
                href={reportUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary inline-flex items-center gap-3 w-full sm:w-auto justify-center"
              >
                <ExternalLink className="w-5 h-5" />
                Visualizar Online
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-10 pt-8 border-t border-border"
            >
              <button
                onClick={onReset}
                className="text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                ← Analisar outras cotações
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ResultSection;
