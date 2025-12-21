import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";

// Importación de los componentes de pasos
import StepOne from "@/components/features/ServiceStepOne";
import StepTwo from "@/components/features/ServiceStepTwo";
import StepThree from "@/components/features/ServiceStepThree";
import StepIndicator from "@/components/features/StepIndicator";

import { useWalletAccount } from "@/hooks/useWalletAccount";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const CreateService = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    price: import.meta.env.MODE === "development" ? 0.01 : 10,
    deliveryTime: "3 days",
    revisions: "Unlimited",
    description: "",
    includes: ["High-quality deliverables", "Fast turnaround time"],
    walletAddress: "",
    imageFile: null,
  });
  const [newIncludeItem, setNewIncludeItem] = useState("");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000"; // Define here or use context
  const API_URL = `${API_BASE_URL}/api/services`;
  const { user: walletAddress } = useWalletAccount();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  // Check if user has profile
  useEffect(() => {
    const checkProfile = async () => {
      if (!walletAddress) return; // Wait for wallet
      try {
        const res = await fetch(`${API_BASE_URL}/api/profile/${walletAddress}`);
        if (res.status === 404) {
          toast({
            title: "Profile Required",
            description: "You need to create a profile before offering a service.",
            variant: "destructive"
          });
          navigate("/profile");
        }
      } catch (error) {
        console.error("Error checking profile", error);
      } finally {
        setProfileLoading(false);
      }
    };

    if (walletAddress) {
      checkProfile();
    } else {
      // If not connected, maybe just let them see the page but button disabled? 
      // Or wait. For now, let's assume if connected we check.
      setProfileLoading(false);
    }

  }, [walletAddress, navigate, toast, API_BASE_URL]);

  /* Manejador cambios inputs */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* Manejador cambios selects */
  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* Manejador carga imagen */
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, imageFile: e.target.files[0] }));
    }
  };

  /* Añadir item a la lista de includes */
  const handleAddIncludeItem = () => {
    const trimmedItem = newIncludeItem.trim();
    if (trimmedItem !== "" && !formData.includes.includes(trimmedItem)) {
      setFormData((prev) => ({
        ...prev,
        includes: [...prev.includes, trimmedItem],
      }));
      setNewIncludeItem("");
    }
  };

  const canAdvance = () => {
    if (step === 1) {
      return (
        formData.title.length > 5 &&
        formData.category !== "" &&
        formData.price > 0.0
      );
    }
    if (step === 2) {
      const wordCount = formData.description
        .split(/\s+/)
        .filter(Boolean).length;
      return (
        wordCount >= 10 &&
        formData.description.length >= 100 &&
        formData.imageFile !== null &&
        formData.includes.length > 0
      );
    }
    return true;
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <StepOne
            formData={formData}
            handleChange={handleChange}
            handleSelectChange={handleSelectChange}
          />
        );
      case 2:
        return (
          <StepTwo
            formData={formData}
            handleChange={handleChange}
            handleImageChange={handleImageChange}
            newIncludeItem={newIncludeItem}
            setNewIncludeItem={setNewIncludeItem}
            handleAddIncludeItem={handleAddIncludeItem}
            setFormData={setFormData}
          />
        );
      case 3:
        return <StepThree formData={formData} />;
      default:
        return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!walletAddress) {
      alert(
        "Error: Wallet not connected. Please connect to publish."
      );
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    const dataToSend = new FormData();

    dataToSend.append("walletAddress", walletAddress);

    dataToSend.append("title", formData.title);
    dataToSend.append("category", formData.category);
    dataToSend.append("price", String(formData.price));
    dataToSend.append("deliveryTime", formData.deliveryTime);
    dataToSend.append("revisions", formData.revisions);
    dataToSend.append("description", formData.description);
    dataToSend.append("includes", JSON.stringify(formData.includes));
    if (formData.imageFile) {
      dataToSend.append("imageFile", formData.imageFile);
    }

    console.log(dataToSend);

    try {
      console.log("Sending FormData to backend...");

      const response = await fetch(API_URL, {
        method: "POST",
        body: dataToSend,
      });

      const result = await response.json();

      if (response.ok) {
        alert(
          `Service published successfully! Image URL: ${result.service.imageUrl}`
        );
        navigate("/");
      } else {
        alert(`Error publishing: ${result.message || "Unknown error"}`);
        console.error("Error del servidor:", result);
      }
    } catch (error) {
      alert(
        "Connection error with server. Ensure your backend is running."
      );
      console.error("Error de red:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-900">
          Offer a New Freelance Service
        </h1>

        {/* Indicador de Pasos (Componente Separado) */}
        <StepIndicator step={step} />

        <form
          className="rounded-xl border bg-white p-8 shadow-lg"
          onSubmit={handleSubmit}
        >
          {renderStepContent()}

          {/* Controles de Navegación */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            {step > 1 ? (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                type="button"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
            ) : (
              <span />
            )}

            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canAdvance()}
                type="button"
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="lg"
                className="bg-green-600 hover:bg-green-700"
                disabled={!canAdvance() || isSubmitting}
              >
                {isSubmitting ? "Publishing..." : "Publish Service Now!"}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateService;
