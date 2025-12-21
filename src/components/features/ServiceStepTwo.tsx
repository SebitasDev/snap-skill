import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

const StepTwo = ({
  formData,
  handleChange,
  handleImageChange,
  newIncludeItem,
  setNewIncludeItem,
  handleAddIncludeItem,
  setFormData, // Se usa para remover items
}) => {
  const handleRemoveIncludeItem = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      includes: prev.includes.filter((_, i) => i !== indexToRemove),
    }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">2. Details & Presentation</h2>

      <div>
        <label
          htmlFor="description"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Detailed Service Description
        </label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={8}
          placeholder="Describe exactly what you offer, your work process, and why they should choose you."
        />
        <p className="text-xs text-muted-foreground mt-1">
          Minimum 120 words to be indexed correctly.
        </p>
      </div>

      <div>
        <label
          htmlFor="imageFile"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Cover Image (Gallery)
        </label>
        <Input
          id="imageFile"
          name="imageFile"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="cursor-pointer"
        />
        {formData.imageFile && (
          <p className="text-sm text-green-600 mt-2">
            Selected image: {formData.imageFile.name}
          </p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          What's Included (Deliverables)
        </label>
        <div className="flex gap-2 mb-2">
          <Input
            placeholder="Ex: Source Files, 3D Design, Mockups"
            value={newIncludeItem}
            onChange={(e) => setNewIncludeItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddIncludeItem();
              }
            }}
          />
          <Button type="button" onClick={handleAddIncludeItem}>
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {formData.includes.map((item, index) => (
            <Badge
              key={index}
              variant="outline"
              className="cursor-pointer flex items-center gap-1"
              onClick={() => handleRemoveIncludeItem(index)}
            >
              <CheckCircle2 className="h-4 w-4 text-primary" />
              {item}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StepTwo;
