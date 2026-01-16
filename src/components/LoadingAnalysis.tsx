import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileSearch, Loader2, Clock } from "lucide-react";

const LoadingAnalysis = () => {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
              animate={{ 
                scale: [1, 1.05, 1],
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-primary/20 flex items-center justify-center"
            >
              <FileSearch className="w-10 h-10 text-primary" />
            </motion.div>

            <h3 className="text-2xl font-bold mb-4">
              Analisando suas cotações...
            </h3>

            <div className="flex items-center justify-center gap-2 mb-6">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-muted-foreground">Processando com IA</span>
            </div>

            {/* Timer */}
            <div className="flex items-center justify-center gap-2 mb-8 text-lg">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span className="font-mono text-foreground">{formatTime(elapsedTime)}</span>
            </div>

            {/* Progress bar indeterminada */}
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-8">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ x: "-100%" }}
                animate={{ x: "200%" }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ width: "50%" }}
              />
            </div>

            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              A análise pode levar até <strong>5 minutos</strong>. 
              <br />
              Não feche esta página enquanto o processamento está em andamento.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LoadingAnalysis;
