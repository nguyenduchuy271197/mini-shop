"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateShippingZone } from "@/hooks/admin/shipping";
import { validateShippingZoneData, vietnamProvinces } from "../_lib/utils";
import { ArrowLeft, X } from "lucide-react";

interface ShippingZone {
  id: number;
  name?: string;
  description?: string;
  countries?: string[];
  states?: string[];
  cities?: string[];
  is_active?: boolean;
}

interface ShippingZoneFormProps {
  mode: "create" | "edit";
  zone?: ShippingZone;
  onBack: () => void;
  onSuccess?: () => void;
}

interface FormData {
  name: string;
  description: string;
  countries: string[];
  states: string[];
  cities: string[];
  is_active: boolean;
}

export function ShippingZoneForm({
  mode,
  zone,
  onBack,
  onSuccess,
}: ShippingZoneFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    countries: ["VN"],
    states: [],
    cities: [],
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const createZoneMutation = useCreateShippingZone({
    onSuccess: () => {
      onSuccess?.();
      onBack();
    },
  });

  // Initialize form data for edit mode
  useEffect(() => {
    if (mode === "edit" && zone) {
      setFormData({
        name: zone.name || "",
        description: zone.description || "",
        countries: zone.countries || ["VN"],
        states: zone.states || [],
        cities: zone.cities || [],
        is_active: zone.is_active ?? true,
      });
    }
  }, [mode, zone]);

  const handleInputChange = (
    field: keyof FormData,
    value: string | string[] | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear specific field error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddState = () => {
    if (selectedState && !formData.states.includes(selectedState)) {
      handleInputChange("states", [...formData.states, selectedState]);
      setSelectedState("");
    }
  };

  const handleRemoveState = (state: string) => {
    handleInputChange(
      "states",
      formData.states.filter((s) => s !== state)
    );
  };

  const handleAddCity = () => {
    if (selectedCity && !formData.cities.includes(selectedCity)) {
      handleInputChange("cities", [...formData.cities, selectedCity]);
      setSelectedCity("");
    }
  };

  const handleRemoveCity = (city: string) => {
    handleInputChange(
      "cities",
      formData.cities.filter((c) => c !== city)
    );
  };

  const validateForm = (): boolean => {
    const newErrors = validateShippingZoneData({
      name: formData.name,
      countries: formData.countries,
      states: formData.states,
      cities: formData.cities,
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData = {
      name: formData.name,
      description: formData.description || undefined,
      countries: formData.countries,
      states: formData.states.length > 0 ? formData.states : undefined,
      cities: formData.cities.length > 0 ? formData.cities : undefined,
      is_active: formData.is_active,
    };

    if (mode === "create") {
      createZoneMutation.mutate(submitData);
    } else {
      // In a real app, this would call update mutation
      console.log("Update zone:", submitData);
    }
  };

  const isSubmitting = createZoneMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle>
            {mode === "create"
              ? "Tạo Khu Vực Giao Hàng Mới"
              : "Chỉnh Sửa Khu Vực Giao Hàng"}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Tên Khu Vực *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="VD: Miền Bắc, Nội thành Hà Nội"
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Mô Tả</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Mô tả chi tiết về khu vực giao hàng"
                  rows={3}
                />
              </div>

              <div>
                <Label>Quốc Gia *</Label>
                <div className="mt-2">
                  <Badge variant="outline" className="mr-2">
                    🇻🇳 Việt Nam
                  </Badge>
                  <p className="text-sm text-gray-500 mt-2">
                    Hiện tại chỉ hỗ trợ giao hàng trong nước
                  </p>
                </div>
              </div>

              {mode === "edit" && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      handleInputChange("is_active", checked)
                    }
                  />
                  <Label htmlFor="is_active">Kích hoạt khu vực giao hàng</Label>
                </div>
              )}
            </div>

            {/* Geographic Settings */}
            <div className="space-y-4">
              <div>
                <Label>Tỉnh/Thành Phố</Label>
                <div className="flex gap-2 mt-2">
                  <Select
                    value={selectedState}
                    onValueChange={setSelectedState}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Chọn tỉnh/thành phố" />
                    </SelectTrigger>
                    <SelectContent>
                      {vietnamProvinces
                        .filter(
                          (province) => !formData.states.includes(province)
                        )
                        .map((province) => (
                          <SelectItem key={province} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    onClick={handleAddState}
                    disabled={!selectedState}
                    size="sm"
                  >
                    Thêm
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.states.map((state) => (
                    <Badge
                      key={state}
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleRemoveState(state)}
                    >
                      {state}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>

                {formData.states.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Để trống để áp dụng cho toàn quốc
                  </p>
                )}
              </div>

              <div>
                <Label>Quận/Huyện/Thành Phố</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    placeholder="Nhập tên quận/huyện"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleAddCity}
                    disabled={!selectedCity}
                    size="sm"
                  >
                    Thêm
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.cities.map((city) => (
                    <Badge
                      key={city}
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleRemoveCity(city)}
                    >
                      {city}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>

                {formData.cities.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Để trống để áp dụng cho toàn bộ tỉnh/thành được chọn
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onBack}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? mode === "create"
                  ? "Đang tạo..."
                  : "Đang cập nhật..."
                : mode === "create"
                ? "Tạo Khu Vực"
                : "Cập Nhật"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
