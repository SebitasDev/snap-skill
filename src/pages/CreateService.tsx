import { useState } from "react";
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

const CreateService = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    price: 0.01,
    deliveryTime: "3 days",
    revisions: "Unlimited",
    description: "",
    includes: ["High-quality deliverables", "Fast turnaround time"],
    walletAddress: "",
    imageFile: null,
  });
  const [newIncludeItem, setNewIncludeItem] = useState("");
  const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/services`;
  const { user: walletAddress } = useWalletAccount();
  const navigate = useNavigate();

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
        "Error: La wallet no está conectada. Por favor, conéctala para publicar."
      );
      return;
    }

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
      console.log("Enviando FormData al backend...");

      const response = await fetch(API_URL, {
        method: "POST",
        body: dataToSend,
      });

      const result = await response.json();

      if (response.ok) {
        alert(
          `Servicio publicado con éxito! URL de la imagen: ${result.service.imageUrl}`
        );
        navigate("/");
      } else {
        alert(`Error al publicar: ${result.message || "Error desconocido"}`);
        console.error("Error del servidor:", result);
      }
    } catch (error) {
      alert(
        "Error de conexión con el servidor. Asegúrate que tu backend esté corriendo."
      );
      console.error("Error de red:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-900">
          Ofrecer un Nuevo Servicio Freelance
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
                <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
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
                Siguiente <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="lg"
                className="bg-green-600 hover:bg-green-700"
                disabled={!canAdvance()} // Se puede deshabilitar si no pasa la validación del paso 3 (aunque step 3 no tiene campos obligatorios)
              >
                ¡Publicar Servicio Ahora!
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateService;
