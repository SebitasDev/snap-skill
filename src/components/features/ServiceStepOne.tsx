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
      <h2 className="text-2xl font-bold">1. Key Information</h2>

      <div>
        <label
          htmlFor="title"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Service Title
        </label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Ex: I will create a professional minimalist logo for your brand"
          maxLength={80}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Max 80 characters. Be clear and attractive.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Category
        </label>
        <Select
          value={formData.category}
          onValueChange={(value) => handleSelectChange("category", value)}
          name="category"
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select the main category" />
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
            Base Price ($)
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
            Delivery Time
          </label>
          <Select
            value={formData.deliveryTime}
            onValueChange={(value) => handleSelectChange("deliveryTime", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1 day">1 day</SelectItem>
              <SelectItem value="3 days">3 days</SelectItem>
              <SelectItem value="5 days">5 days</SelectItem>
              <SelectItem value="7 days">7 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label
            htmlFor="revisions"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Revisions
          </label>
          <Select
            value={formData.revisions}
            onValueChange={(value) => handleSelectChange("revisions", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="Unlimited">Unlimited</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default StepOne;
