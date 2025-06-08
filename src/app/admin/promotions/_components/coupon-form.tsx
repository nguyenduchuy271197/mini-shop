"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useCreateCoupon, useUpdateCoupon } from "@/hooks/admin/coupons";
import {
  couponTypes,
  validateCouponCode,
  validateCouponData,
} from "../_lib/utils";
import { Coupon } from "@/types/custom.types";
import { ArrowLeft } from "lucide-react";

interface CouponFormProps {
  mode: "create" | "edit";
  coupon?: Coupon;
  onBack: () => void;
  onSuccess?: () => void;
}

interface FormData {
  code: string;
  name: string;
  type: "percentage" | "fixed_amount";
  value: number;
  minimum_amount?: number;
  maximum_discount?: number;
  usage_limit?: number;
  starts_at?: string;
  expires_at?: string;
  is_active: boolean;
}

export function CouponForm({
  mode,
  coupon,
  onBack,
  onSuccess,
}: CouponFormProps) {
  const [formData, setFormData] = useState<FormData>({
    code: "",
    name: "",
    type: "percentage",
    value: 0,
    minimum_amount: undefined,
    maximum_discount: undefined,
    usage_limit: undefined,
    starts_at: "",
    expires_at: "",
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createCouponMutation = useCreateCoupon({
    onSuccess: () => {
      onSuccess?.();
      onBack();
    },
  });

  const updateCouponMutation = useUpdateCoupon({
    onSuccess: () => {
      onSuccess?.();
      onBack();
    },
  });

  // Initialize form data for edit mode
  useEffect(() => {
    if (mode === "edit" && coupon) {
      setFormData({
        code: coupon.code,
        name: coupon.name,
        type: coupon.type as "percentage" | "fixed_amount",
        value: coupon.value,
        minimum_amount: coupon.minimum_amount || undefined,
        maximum_discount: coupon.maximum_discount || undefined,
        usage_limit: coupon.usage_limit || undefined,
        starts_at: coupon.starts_at
          ? new Date(coupon.starts_at).toISOString().slice(0, 16)
          : "",
        expires_at: coupon.expires_at
          ? new Date(coupon.expires_at).toISOString().slice(0, 16)
          : "",
        is_active: coupon.is_active,
      });
    }
  }, [mode, coupon]);

  const handleInputChange = (
    field: keyof FormData,
    value: string | number | boolean | undefined
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear specific field error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate coupon code
    const codeError = validateCouponCode(formData.code);
    if (codeError) {
      newErrors.code = codeError;
    }

    // Validate other fields
    const dataErrors = validateCouponData({
      name: formData.name,
      type: formData.type,
      value: formData.value,
      minimum_amount: formData.minimum_amount,
      maximum_discount: formData.maximum_discount,
      usage_limit: formData.usage_limit,
      starts_at: formData.starts_at,
      expires_at: formData.expires_at,
    });

    Object.assign(newErrors, dataErrors);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Convert datetime-local format to ISO string for backend validation
    const convertToISOString = (datetimeLocal?: string) => {
      if (!datetimeLocal) return undefined;
      // datetime-local format: YYYY-MM-DDTHH:mm
      // Convert to ISO string by adding seconds and timezone
      return new Date(datetimeLocal).toISOString();
    };

    const submitData = {
      code: formData.code,
      name: formData.name,
      type: formData.type,
      value: formData.value,
      minimum_amount: formData.minimum_amount,
      maximum_discount: formData.maximum_discount,
      usage_limit: formData.usage_limit,
      starts_at: convertToISOString(formData.starts_at),
      expires_at: convertToISOString(formData.expires_at),
    };

    if (mode === "create") {
      createCouponMutation.mutate(submitData);
    } else if (coupon) {
      updateCouponMutation.mutate({
        couponId: coupon.id,
        data: {
          ...submitData,
          is_active: formData.is_active,
        },
      });
    }
  };

  const isSubmitting =
    createCouponMutation.isPending || updateCouponMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle>
            {mode === "create"
              ? "Tạo Mã Giảm Giá Mới"
              : "Chỉnh Sửa Mã Giảm Giá"}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="code">Mã Coupon *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    handleInputChange("code", e.target.value.toUpperCase())
                  }
                  placeholder="VD: SALE20, FREESHIP"
                  disabled={mode === "edit"}
                  className={errors.code ? "border-destructive" : ""}
                />
                {errors.code && (
                  <p className="text-sm text-destructive mt-1">{errors.code}</p>
                )}
              </div>

              <div>
                <Label htmlFor="name">Tên Chương Trình *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="VD: Giảm giá 20% cho đơn hàng đầu tiên"
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="type">Loại Giảm Giá *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "percentage" | "fixed_amount") =>
                    handleInputChange("type", value)
                  }
                >
                  <SelectTrigger
                    className={errors.type ? "border-destructive" : ""}
                  >
                    <SelectValue placeholder="Chọn loại giảm giá" />
                  </SelectTrigger>
                  <SelectContent>
                    {couponTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-destructive mt-1">{errors.type}</p>
                )}
              </div>

              <div>
                <Label htmlFor="value">
                  Giá Trị * {formData.type === "percentage" ? "(%)" : "(VND)"}
                </Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.value || ""}
                  onChange={(e) =>
                    handleInputChange("value", Number(e.target.value))
                  }
                  placeholder={
                    formData.type === "percentage" ? "VD: 20" : "VD: 50000"
                  }
                  min="0"
                  max={formData.type === "percentage" ? "100" : undefined}
                  className={errors.value ? "border-destructive" : ""}
                />
                {errors.value && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.value}
                  </p>
                )}
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="minimum_amount">Đơn Hàng Tối Thiểu (VND)</Label>
                <Input
                  id="minimum_amount"
                  type="number"
                  value={formData.minimum_amount || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "minimum_amount",
                      Number(e.target.value) || undefined
                    )
                  }
                  placeholder="VD: 100000"
                  min="0"
                  className={errors.minimum_amount ? "border-destructive" : ""}
                />
                {errors.minimum_amount && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.minimum_amount}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Để trống nếu không có giới hạn
                </p>
              </div>

              {formData.type === "percentage" && (
                <div>
                  <Label htmlFor="maximum_discount">Giảm Tối Đa (VND)</Label>
                  <Input
                    id="maximum_discount"
                    type="number"
                    value={formData.maximum_discount || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "maximum_discount",
                        Number(e.target.value) || undefined
                      )
                    }
                    placeholder="VD: 100000"
                    min="0"
                    className={
                      errors.maximum_discount ? "border-destructive" : ""
                    }
                  />
                  {errors.maximum_discount && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.maximum_discount}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    Để trống nếu không có giới hạn
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="usage_limit">Giới Hạn Sử Dụng</Label>
                <Input
                  id="usage_limit"
                  type="number"
                  value={formData.usage_limit || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "usage_limit",
                      Number(e.target.value) || undefined
                    )
                  }
                  placeholder="VD: 100"
                  min="1"
                  className={errors.usage_limit ? "border-destructive" : ""}
                />
                {errors.usage_limit && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.usage_limit}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Để trống nếu không giới hạn
                </p>
              </div>

              <div>
                <Label htmlFor="starts_at">Ngày Bắt Đầu</Label>
                <Input
                  id="starts_at"
                  type="datetime-local"
                  value={formData.starts_at}
                  onChange={(e) =>
                    handleInputChange("starts_at", e.target.value)
                  }
                  className={errors.starts_at ? "border-destructive" : ""}
                />
                {errors.starts_at && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.starts_at}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="expires_at">Ngày Hết Hạn</Label>
                <Input
                  id="expires_at"
                  type="datetime-local"
                  value={formData.expires_at}
                  onChange={(e) =>
                    handleInputChange("expires_at", e.target.value)
                  }
                  className={errors.expires_at ? "border-destructive" : ""}
                />
                {errors.expires_at && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.expires_at}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Để trống nếu không có hạn sử dụng
                </p>
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
                  <Label htmlFor="is_active">Kích hoạt mã giảm giá</Label>
                </div>
              )}
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
                ? "Tạo Mã Giảm Giá"
                : "Cập Nhật"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
