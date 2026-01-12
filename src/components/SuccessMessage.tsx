import { motion } from "framer-motion";
import { CheckCircle, Mail, RotateCcw } from "lucide-react";

interface SuccessMessageProps {
  fileCount: number;
  onReset: () => void;
}

const SuccessMessage = ({ fileCount, onReset }: SuccessMessageProps) => {
  return (
    <section className="py-16">
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
              className="text-3xl font-bold mb-4"
            >
              {fileCount === 1 ? "Cotação enviada" : "Cotações enviadas"}{" "}
              <span className="text-gradient">com sucesso!</span>
            </motion.h3>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground mb-8 max-w-md mx-auto"
            >
              Nossa IA está processando suas cotações. Você receberá o relatório comparativo em breve.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20 mb-8"
            >
              <Mail className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">
                O relatório será enviado para seu e-mail quando estiver pronto
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <button
                onClick={onReset}
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
};

export default SuccessMessage;
