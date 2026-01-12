import { useState, useCallback, useEffect } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import UploadZone from "@/components/UploadZone";
import ProcessingStatus, { ProcessingStep } from "@/components/ProcessingStatus";
import ResultSection from "@/components/ResultSection";
import BenefitsSection from "@/components/BenefitsSection";
import Footer from "@/components/Footer";

type AppState = "idle" | "processing" | "completed";

const Index = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [appState, setAppState] = useState<AppState>("idle");
  const [processingStep, setProcessingStep] = useState<ProcessingStep>("uploading");
  const [reportUrl, setReportUrl] = useState<string | undefined>();
  const [completedTimestamp, setCompletedTimestamp] = useState<Date>(new Date());

  // Simulated processing flow (will be replaced with real API calls)
  const simulateProcessing = useCallback(async () => {
    setAppState("processing");
    setProcessingStep("uploading");
    
    // Simulate uploading
    await new Promise((r) => setTimeout(r, 1500));
    setProcessingStep("processing");
    
    // Simulate AI processing
    await new Promise((r) => setTimeout(r, 2500));
    setProcessingStep("generating");
    
    // Simulate report generation
    await new Promise((r) => setTimeout(r, 2000));
    setProcessingStep("completed");
    
    // Transition to completed state after a brief moment
    await new Promise((r) => setTimeout(r, 1000));
    setCompletedTimestamp(new Date());
    setReportUrl("#demo-report"); // Will be replaced with real URL
    setAppState("completed");
  }, []);

  const handleSubmit = () => {
    if (files.length === 0) return;
    simulateProcessing();
  };

  const handleReset = () => {
    setFiles([]);
    setAppState("idle");
    setProcessingStep("uploading");
    setReportUrl(undefined);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <HeroSection />
        
        {appState === "idle" && (
          <UploadZone
            files={files}
            setFiles={setFiles}
            onSubmit={handleSubmit}
            isProcessing={false}
          />
        )}
        
        {appState === "processing" && (
          <ProcessingStatus currentStep={processingStep} />
        )}
        
        {appState === "completed" && (
          <ResultSection
            reportUrl={reportUrl}
            timestamp={completedTimestamp}
            onReset={handleReset}
          />
        )}
        
        <BenefitsSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
