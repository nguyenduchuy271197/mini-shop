import { CalendarIcon, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { bannerPositionOptions, bannerTargetOptions } from "../_lib/utils";

interface BannerAdvancedFieldsProps {
  formData: {
    link_url: string;
    target_type: string;
    position: string;
    priority: number;
    is_active: boolean;
  };
  startDate?: Date;
  endDate?: Date;
  onInputChange: (field: string, value: string | boolean | number) => void;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
}

export default function BannerAdvancedFields({
  formData,
  startDate,
  endDate,
  onInputChange,
  onStartDateChange,
  onEndDateChange,
}: BannerAdvancedFieldsProps) {
  return (
    <div className="space-y-6">
      {/* Link Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="link_url">URL liên kết</Label>
          <Input
            id="link_url"
            value={formData.link_url}
            onChange={(e) => onInputChange("link_url", e.target.value)}
            placeholder="https://example.com"
            type="url"
          />
        </div>

        <div>
          <Label htmlFor="target_type">Mở liên kết</Label>
          <Select
            value={formData.target_type}
            onValueChange={(value) => onInputChange("target_type", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {bannerTargetOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Position and Priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="position">Vị trí hiển thị *</Label>
          <Select
            value={formData.position}
            onValueChange={(value) => onInputChange("position", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {bannerPositionOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="priority">Độ ưu tiên</Label>
          <Input
            id="priority"
            type="number"
            min="0"
            value={formData.priority}
            onChange={(e) =>
              onInputChange("priority", parseInt(e.target.value) || 0)
            }
            placeholder="0"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Số càng cao, độ ưu tiên càng cao
          </p>
        </div>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Ngày bắt đầu</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate
                  ? startDate.toLocaleDateString("vi-VN")
                  : "Chọn ngày bắt đầu"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={onStartDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label>Ngày kết thúc</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate
                  ? endDate.toLocaleDateString("vi-VN")
                  : "Chọn ngày kết thúc"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={onEndDateChange}
                initialFocus
                disabled={(date) => (startDate ? date < startDate : false)}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => onInputChange("is_active", checked)}
        />
        <Label htmlFor="is_active">Kích hoạt banner</Label>
      </div>

      {/* Preview */}
      {formData.link_url && (
        <div>
          <Label>Xem trước</Label>
          <Button
            type="button"
            variant="outline"
            onClick={() => window.open(formData.link_url, formData.target_type)}
            className="w-full"
          >
            <Eye className="h-4 w-4 mr-2" />
            Xem trước liên kết
          </Button>
        </div>
      )}
    </div>
  );
}
