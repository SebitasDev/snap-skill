import { DollarSign, Clock, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const StepThree = ({ formData }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">3. Revisar y Publicar</h2>
      <div className="rounded-lg border p-6 bg-gray-50">
        <h3 className="text-xl font-bold mb-4">Resumen del Servicio</h3>
        <div className="space-y-3">
          <p className="text-lg font-semibold">
            {formData.title || "Sin título"}
          </p>
          <p className="text-sm text-muted-foreground">
            Categoría:{" "}
            <span className="font-medium">
              {formData.category || "No definida"}
            </span>
          </p>

          <div className="grid grid-cols-3 gap-4 border-t pt-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="font-semibold">${formData.price}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm">{formData.deliveryTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-primary" />
              <span className="text-sm">{formData.revisions} Rev.</span>
            </div>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            **Descripción:** {formData.description.substring(0, 150)}...
          </p>

          <div className="mt-4">
            <p className="font-semibold mb-2">Incluye:</p>
            <div className="flex flex-wrap gap-2">
              {formData.includes.map((item, index) => (
                <Badge key={index} variant="secondary">
                  {item}
                </Badge>
              ))}
            </div>
          </div>

          {formData.imageFile && (
            <p className="text-xs mt-3 text-muted-foreground">
              Imagen: {formData.imageFile.name} (Lista para subir)
            </p>
          )}
        </div>
      </div>
      <p className="text-sm text-center text-gray-700 font-medium">
        Al hacer clic en "Publicar", aceptas los términos y condiciones de
        SkillHub.
      </p>
    </div>
  );
};

export default StepThree;
