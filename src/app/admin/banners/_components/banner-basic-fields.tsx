import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface BannerBasicFieldsProps {
  formData: {
    title: string;
    description: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export default function BannerBasicFields({
  formData,
  onInputChange,
}: BannerBasicFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      <div>
        <Label htmlFor="title">Tiêu đề banner *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => onInputChange("title", e.target.value)}
          placeholder="Nhập tiêu đề banner"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onInputChange("description", e.target.value)}
          placeholder="Mô tả ngắn về banner"
          rows={3}
        />
      </div>
    </div>
  );
}
