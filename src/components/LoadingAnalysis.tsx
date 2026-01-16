import { motion } from "framer-motion";
import { Loader2, FileSearch } from "lucide-react";

const LoadingAnalysis = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto"
        >
          <div className="card-elevated p-8 md:p-12 text-center">
            {/* Animated Icon */}
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-primary/20 flex items-center justify-center"
            >
              <FileSearch className="w-12 h-12 text-primary" />
            </motion.div>

            <h2 className="text-2xl font-bold mb-4">
              Analisando suas cotações...
            </h2>

            {/* Spinner */}
            <div className="flex justify-center mb-6">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>

            {/* Indeterminate progress bar */}
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

            <p className="text-muted-foreground mb-2">
              Isso pode levar alguns minutos.
            </p>
            <p className="text-sm text-muted-foreground/70">
              Não feche esta página.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LoadingAnalysis;
