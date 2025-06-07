"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useCreateBanner, useUpdateBanner } from "@/hooks/admin/banners";
import type { Banner } from "@/hooks/admin/banners";
import {
  validateBannerData,
  getBannerFormDefaults,
  validateImageUrl,
} from "../_lib/utils";
import BannerBasicFields from "./banner-basic-fields";
import BannerImageUpload from "./banner-image-upload";
import BannerAdvancedFields from "./banner-advanced-fields";

interface BannerFormProps {
  banner?: Banner;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function BannerForm({
  banner,
  onSuccess,
  onCancel,
}: BannerFormProps) {
  const { toast } = useToast();
  const isEditing = !!banner;

  const [formData, setFormData] = useState(() => {
    if (banner) {
      return {
        title: banner.title,
        description: banner.description || "",
        image_url: banner.image_url,
        link_url: banner.link_url || "",
        position: banner.position,
        is_active: banner.is_active,
        start_date: banner.start_date || "",
        end_date: banner.end_date || "",
        target_type: banner.target_type,
        priority: banner.priority,
      };
    }
    return getBannerFormDefaults();
  });

  const [startDate, setStartDate] = useState<Date | undefined>(
    banner?.start_date ? new Date(banner.start_date) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    banner?.end_date ? new Date(banner.end_date) : undefined
  );

  // Update dates when they change
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      start_date: startDate ? startDate.toISOString().split("T")[0] : "",
      end_date: endDate ? endDate.toISOString().split("T")[0] : "",
    }));
  }, [startDate, endDate]);

  // Mutations
  const { mutate: createBanner, isPending: isCreating } = useCreateBanner({
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã tạo banner thành công",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description:
          typeof error === "string" ? error : (error as Error).message,
        variant: "destructive",
      });
    },
  });

  const { mutate: updateBanner, isPending: isUpdating } = useUpdateBanner({
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã cập nhật banner thành công",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description:
          typeof error === "string" ? error : (error as Error).message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    const errors = validateBannerData(formData);
    if (errors.length > 0) {
      toast({
        title: "Lỗi validation",
        description: errors[0],
        variant: "destructive",
      });
      return;
    }

    // Validate image URL
    if (!validateImageUrl(formData.image_url)) {
      toast({
        title: "Lỗi",
        description: "URL hình ảnh không hợp lệ",
        variant: "destructive",
      });
      return;
    }

    const submitData = {
      ...formData,
      start_date: formData.start_date || undefined,
      end_date: formData.end_date || undefined,
      link_url: formData.link_url || undefined,
      description: formData.description || undefined,
    };

    if (isEditing && banner) {
      updateBanner({
        bannerId: banner.id,
        data: submitData,
      });
    } else {
      createBanner(submitData);
    }
  };

  const handleInputChange = (
    field: string,
    value: string | boolean | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isPending = isCreating || isUpdating;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? "Chỉnh sửa banner" : "Tạo banner mới"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Fields */}
          <BannerBasicFields
            formData={formData}
            onInputChange={handleInputChange}
          />

          {/* Image Upload */}
          <BannerImageUpload
            imageUrl={formData.image_url}
            onImageChange={(url) => handleInputChange("image_url", url)}
          />

          {/* Advanced Fields */}
          <BannerAdvancedFields
            formData={formData}
            startDate={startDate}
            endDate={endDate}
            onInputChange={handleInputChange}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Đang xử lý..." : isEditing ? "Cập nhật" : "Tạo banner"}
        </Button>
      </div>
    </form>
  );
}
