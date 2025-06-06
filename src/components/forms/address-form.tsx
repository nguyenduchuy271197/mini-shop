"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { Address } from "@/types/custom.types";

interface AddressFormData {
  type: "shipping" | "billing";
  full_name: string;
  phone_number: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

interface AddressFormProps {
  initialData?: Partial<Address>;
  onSubmit: (data: AddressFormData) => void;
  isLoading?: boolean;
  submitText?: string;
}

export default function AddressForm({
  initialData,
  onSubmit,
  isLoading = false,
  submitText = "Lưu địa chỉ",
}: AddressFormProps) {
  const [formData, setFormData] = useState<AddressFormData>({
    type: (initialData?.type as "shipping" | "billing") || "shipping",
    full_name: initialData
      ? `${initialData.first_name || ""} ${initialData.last_name || ""}`.trim()
      : "",
    phone_number: initialData?.phone || "",
    address_line_1: initialData?.address_line_1 || "",
    address_line_2: initialData?.address_line_2 || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    postal_code: initialData?.postal_code || "",
    country: initialData?.country || "Vietnam",
    is_default: initialData?.is_default || false,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof AddressFormData, string>>
  >({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AddressFormData, string>> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = "Họ và tên là bắt buộc";
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = "Số điện thoại là bắt buộc";
    }

    if (!formData.address_line_1.trim()) {
      newErrors.address_line_1 = "Địa chỉ là bắt buộc";
    }

    if (!formData.city.trim()) {
      newErrors.city = "Thành phố là bắt buộc";
    }

    if (!formData.state.trim()) {
      newErrors.state = "Tỉnh/Thành phố là bắt buộc";
    }

    if (!formData.postal_code.trim()) {
      newErrors.postal_code = "Mã bưu điện là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (
    field: keyof AddressFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Address Type */}
      <div className="space-y-2">
        <Label htmlFor="type">Loại địa chỉ</Label>
        <Select
          value={formData.type}
          onValueChange={(value: "shipping" | "billing") =>
            handleInputChange("type", value)
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="shipping">Địa chỉ giao hàng</SelectItem>
            <SelectItem value="billing">Địa chỉ thanh toán</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="full_name">Họ và tên *</Label>
        <Input
          id="full_name"
          value={formData.full_name}
          onChange={(e) => handleInputChange("full_name", e.target.value)}
          className={errors.full_name ? "border-red-500" : ""}
        />
        {errors.full_name && (
          <p className="text-sm text-red-600">{errors.full_name}</p>
        )}
      </div>

      {/* Phone Number */}
      <div className="space-y-2">
        <Label htmlFor="phone_number">Số điện thoại *</Label>
        <Input
          id="phone_number"
          value={formData.phone_number}
          onChange={(e) => handleInputChange("phone_number", e.target.value)}
          className={errors.phone_number ? "border-red-500" : ""}
          placeholder="+84 123 456 789"
        />
        {errors.phone_number && (
          <p className="text-sm text-red-600">{errors.phone_number}</p>
        )}
      </div>

      {/* Address Lines */}
      <div className="space-y-2">
        <Label htmlFor="address_line_1">Địa chỉ *</Label>
        <Input
          id="address_line_1"
          value={formData.address_line_1}
          onChange={(e) => handleInputChange("address_line_1", e.target.value)}
          className={errors.address_line_1 ? "border-red-500" : ""}
          placeholder="Số nhà, tên đường"
        />
        {errors.address_line_1 && (
          <p className="text-sm text-red-600">{errors.address_line_1}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address_line_2">Địa chỉ 2 (tùy chọn)</Label>
        <Input
          id="address_line_2"
          value={formData.address_line_2}
          onChange={(e) => handleInputChange("address_line_2", e.target.value)}
          placeholder="Căn hộ, tòa nhà, khu vực"
        />
      </div>

      {/* Location Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">Thành phố *</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => handleInputChange("city", e.target.value)}
            className={errors.city ? "border-red-500" : ""}
          />
          {errors.city && <p className="text-sm text-red-600">{errors.city}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">Tỉnh/Thành phố *</Label>
          <Input
            id="state"
            value={formData.state}
            onChange={(e) => handleInputChange("state", e.target.value)}
            className={errors.state ? "border-red-500" : ""}
          />
          {errors.state && (
            <p className="text-sm text-red-600">{errors.state}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="postal_code">Mã bưu điện *</Label>
          <Input
            id="postal_code"
            value={formData.postal_code}
            onChange={(e) => handleInputChange("postal_code", e.target.value)}
            className={errors.postal_code ? "border-red-500" : ""}
          />
          {errors.postal_code && (
            <p className="text-sm text-red-600">{errors.postal_code}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Quốc gia</Label>
          <Select
            value={formData.country}
            onValueChange={(value: string) =>
              handleInputChange("country", value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Vietnam">Việt Nam</SelectItem>
              <SelectItem value="USA">Hoa Kỳ</SelectItem>
              <SelectItem value="Japan">Nhật Bản</SelectItem>
              <SelectItem value="Korea">Hàn Quốc</SelectItem>
              <SelectItem value="China">Trung Quốc</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Default Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_default"
          checked={formData.is_default}
          onCheckedChange={(checked: boolean) => {
            handleInputChange("is_default", checked);
          }}
        />
        <Label htmlFor="is_default" className="text-sm">
          Đặt làm địa chỉ mặc định
        </Label>
      </div>

      {/* Submit Button */}
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Đang xử lý..." : submitText}
      </Button>
    </form>
  );
}
