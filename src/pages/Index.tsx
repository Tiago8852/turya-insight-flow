import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import UploadZone from "@/components/UploadZone";
import LoadingAnalysis from "@/components/LoadingAnalysis";
import DownloadReport from "@/components/DownloadReport";
import ErrorMessage from "@/components/ErrorMessage";
import BenefitsSection from "@/components/BenefitsSection";
import Footer from "@/components/Footer";

type AppState = "upload" | "processing" | "completed" | "error";

const Index = () => {
  const [appState, setAppState] = useState<AppState>("upload");
  const [htmlBlob, setHtmlBlob] = useState<Blob | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleStartProcessing = () => {
    setAppState("processing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSuccess = (blob: Blob) => {
    setHtmlBlob(blob);
    setAppState("completed");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleError = (message: string) => {
    setErrorMessage(message);
    setAppState("error");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    setAppState("upload");
    setHtmlBlob(null);
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <HeroSection />

        {appState === "upload" && (
          <UploadZone 
            onSuccess={handleSuccess}
            onError={handleError}
            onStartProcessing={handleStartProcessing}
          />
        )}

        {appState === "processing" && (
          <LoadingAnalysis />
        )}

        {appState === "completed" && htmlBlob && (
          <DownloadReport htmlBlob={htmlBlob} onReset={handleReset} />
        )}

        {appState === "error" && (
          <ErrorMessage message={errorMessage} onRetry={handleReset} />
        )}

        <BenefitsSection />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
