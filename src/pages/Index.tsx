import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import UploadZone from "@/components/UploadZone";
import SuccessMessage from "@/components/SuccessMessage";
import BenefitsSection from "@/components/BenefitsSection";
import Footer from "@/components/Footer";

const Index = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [submittedCount, setSubmittedCount] = useState(0);

  const handleSuccess = (email: string, fileCount: number) => {
    setSubmittedEmail(email);
    setSubmittedCount(fileCount);
    setIsSuccess(true);
    // Scroll to top of success message
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    setIsSuccess(false);
    setSubmittedEmail("");
    setSubmittedCount(0);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <HeroSection />
        
        {!isSuccess ? (
          <UploadZone onSuccess={handleSuccess} />
        ) : (
          <SuccessMessage
            email={submittedEmail}
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
