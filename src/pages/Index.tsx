import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import UploadZone from "@/components/UploadZone";
import SuccessMessage from "@/components/SuccessMessage";
import BenefitsSection from "@/components/BenefitsSection";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

type AppState = "idle" | "uploading" | "success";

const Index = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [appState, setAppState] = useState<AppState>("idle");
  const [submittedCount, setSubmittedCount] = useState(0);
  const { toast } = useToast();

  // TODO: Replace with real Supabase upload and webhook trigger
  const handleSubmit = async () => {
    if (files.length === 0) return;
    
    setAppState("uploading");
    
    try {
      // Simulate upload delay - will be replaced with real Supabase upload
      await new Promise((r) => setTimeout(r, 1500));
      
      // TODO: Upload files to Supabase Storage
      // TODO: Trigger n8n webhook with file references
      
      setSubmittedCount(files.length);
      setAppState("success");
      
    } catch (error) {
      console.error("Error uploading files:", error);
      toast({
        title: "Erro ao enviar",
        description: "Ocorreu um erro ao enviar seus arquivos. Tente novamente.",
        variant: "destructive",
      });
      setAppState("idle");
    }
  };

  const handleReset = () => {
    setFiles([]);
    setAppState("idle");
    setSubmittedCount(0);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <HeroSection />
        
        {appState !== "success" && (
          <UploadZone
            files={files}
            setFiles={setFiles}
            onSubmit={handleSubmit}
            isProcessing={appState === "uploading"}
          />
        )}
        
        {appState === "success" && (
          <SuccessMessage
            fileCount={submittedCount}
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
