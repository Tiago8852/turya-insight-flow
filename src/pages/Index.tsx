import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import UploadZone from "@/components/UploadZone";
import ProcessingStatus from "@/components/ProcessingStatus";
import DownloadReport from "@/components/DownloadReport";
import BenefitsSection from "@/components/BenefitsSection";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

type AppState = "upload" | "processing" | "completed";
type ProcessingStage = "uploading" | "processing" | "generating" | "completed";

const Index = () => {
  const [appState, setAppState] = useState<AppState>("upload");
  const [sessionId, setSessionId] = useState<string>("");
  const [fileCount, setFileCount] = useState(0);
  const [processingStage, setProcessingStage] = useState<ProcessingStage>("uploading");
  const [progress, setProgress] = useState(0);
  const [reportUrl, setReportUrl] = useState<string>("");

  // Handle successful upload
  const handleUploadSuccess = (newSessionId: string, count: number) => {
    setSessionId(newSessionId);
    setFileCount(count);
    setAppState("processing");
    setProcessingStage("uploading");
    setProgress(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Simulate progress animation for stages
  useEffect(() => {
    if (appState !== "processing") return;

    const stageProgress: Record<ProcessingStage, number> = {
      uploading: 25,
      processing: 60,
      generating: 90,
      completed: 100,
    };

    const targetProgress = stageProgress[processingStage];
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= targetProgress) {
          clearInterval(interval);
          return targetProgress;
        }
        return Math.min(prev + 1, targetProgress);
      });
    }, 50);

    return () => clearInterval(interval);
  }, [appState, processingStage]);

  // Progress through stages automatically (upload stage transitions quickly)
  useEffect(() => {
    if (appState !== "processing") return;

    if (processingStage === "uploading") {
      const timer = setTimeout(() => {
        setProcessingStage("processing");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [appState, processingStage]);

  // Listen for external report URL (can be set via window event or polling)
  useEffect(() => {
    const handleReportReady = (event: CustomEvent<{ url: string }>) => {
      console.log("Report ready:", event.detail.url);
      setReportUrl(event.detail.url);
      setProcessingStage("completed");
      setProgress(100);
      
      setTimeout(() => {
        setAppState("completed");
      }, 1500);
    };

    window.addEventListener("reportReady", handleReportReady as EventListener);
    
    return () => {
      window.removeEventListener("reportReady", handleReportReady as EventListener);
    };
  }, []);

  // Expose a global function to receive the report URL externally
  useEffect(() => {
    (window as any).setReportUrl = (url: string) => {
      console.log("Report URL received:", url);
      window.dispatchEvent(
        new CustomEvent("reportReady", { detail: { url } })
      );
    };

    return () => {
      delete (window as any).setReportUrl;
    };
  }, []);

  const handleReset = () => {
    setAppState("upload");
    setSessionId("");
    setFileCount(0);
    setProcessingStage("uploading");
    setProgress(0);
    setReportUrl("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <HeroSection />

        {appState === "upload" && (
          <UploadZone onSuccess={handleUploadSuccess} />
        )}

        {appState === "processing" && (
          <section className="py-16">
            <div className="container mx-auto px-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl mx-auto"
              >
                <div className="card-elevated p-8 md:p-12">
                  <h2 className="text-2xl font-bold text-center mb-2">
                    Analisando suas cotações
                  </h2>
                  <p className="text-muted-foreground text-center mb-8">
                    {fileCount} {fileCount === 1 ? "arquivo" : "arquivos"} sendo processado{fileCount !== 1 ? "s" : ""}
                  </p>
                  
                  <ProcessingStatus stage={processingStage} progress={progress} />

                  <p className="text-center text-sm text-muted-foreground mt-8">
                    Aguarde enquanto nossa IA analisa as cotações...
                  </p>
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {appState === "completed" && (
          <DownloadReport reportUrl={reportUrl} onReset={handleReset} />
        )}

        <BenefitsSection />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
