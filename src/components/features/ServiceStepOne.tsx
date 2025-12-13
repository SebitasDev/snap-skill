import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DollarSign } from "lucide-react";
import { categories } from "@/data/mockData";

const StepOne = ({ formData, handleChange, handleSelectChange }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">1. Información Clave</h2>

      <div>
        <label
          htmlFor="title"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Título del Servicio
        </label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Ej: Crearé un logotipo profesional minimalista para tu marca"
          maxLength={80}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Máximo 80 caracteres. Sé claro y atractivo.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Categoría
        </label>
        <Select
          value={formData.category}
          onValueChange={(value) => handleSelectChange("category", value)}
          name="category"
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona la categoría principal" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(({ name }) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="price"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Precio Base ($)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="price"
              name="price"
              type="text"
              value={formData.price}
              readOnly
              disabled
              className="pl-10 bg-gray-100 cursor-not-allowed"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="deliveryTime"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Tiempo de Entrega
          </label>
          <Select value={formData.deliveryTime} name="deliveryTime" disabled>
            <SelectTrigger className="w-full bg-gray-100 cursor-not-allowed">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1 day">1 día</SelectItem>
              <SelectItem value="3 days">3 días</SelectItem>
              <SelectItem value="5 days">5 días</SelectItem>
              <SelectItem value="7 days">7 días</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label
            htmlFor="revisions"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Revisiones
          </label>
          <Select value={formData.revisions} name="revisions" disabled>
            <SelectTrigger className="w-full bg-gray-100 cursor-not-allowed">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="Unlimited">Ilimitadas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default StepOne;
