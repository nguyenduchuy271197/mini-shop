"use client";

import { useState, useEffect } from "react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Save } from "lucide-react";
import { useProfile, useUpdateProfile } from "@/hooks/users";

interface FormData {
  full_name: string;
  phone: string;
  date_of_birth: string;
  gender: "male" | "female" | "other" | "";
}

interface FormErrors {
  full_name?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
}

export default function ProfileForm() {
  const { data: profileData, isLoading: isLoadingProfile } = useProfile();
  const updateProfile = useUpdateProfile();

  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    phone: "",
    date_of_birth: "",
    gender: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Load profile data when available
  useEffect(() => {
    if (profileData?.success && profileData.profile) {
      const profile = profileData.profile;
      setFormData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        date_of_birth: profile.date_of_birth || "",
        gender: (profile.gender as "male" | "female" | "other") || "",
      });
    }
  }, [profileData]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate full name
    if (!formData.full_name.trim()) {
      newErrors.full_name = "Họ tên là bắt buộc";
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = "Họ tên phải có ít nhất 2 ký tự";
    }

    // Validate phone (optional but must be valid if provided)
    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    // Validate date of birth (optional but must be valid if provided)
    if (formData.date_of_birth) {
      const date = new Date(formData.date_of_birth);
      const now = new Date();
      const age = now.getFullYear() - date.getFullYear();

      if (isNaN(date.getTime()) || age < 13 || age > 120) {
        newErrors.date_of_birth = "Ngày sinh không hợp lệ";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Only send non-empty values
    const updateData: {
      full_name?: string;
      phone?: string;
      date_of_birth?: string;
      gender?: "male" | "female" | "other";
    } = {};

    if (formData.full_name.trim()) {
      updateData.full_name = formData.full_name.trim();
    }
    if (formData.phone.trim()) {
      updateData.phone = formData.phone.trim();
    }
    if (formData.date_of_birth) {
      updateData.date_of_birth = formData.date_of_birth;
    }
    if (formData.gender !== "") {
      updateData.gender = formData.gender;
    }

    updateProfile.mutate(updateData);
  };

  const handleInputChange =
    (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      }
    };

  const handleGenderChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      gender: value as "male" | "female" | "other" | "",
    }));
  };

  if (isLoadingProfile) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Đang tải thông tin...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin cá nhân</CardTitle>
        <CardDescription>Cập nhật thông tin cá nhân của bạn</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Họ và tên *</Label>
            <Input
              id="full_name"
              type="text"
              value={formData.full_name}
              onChange={handleInputChange("full_name")}
              placeholder="Nhập họ và tên của bạn"
              disabled={updateProfile.isPending}
            />
            {errors.full_name && (
              <p className="text-sm text-red-600">{errors.full_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange("phone")}
              placeholder="Nhập số điện thoại"
              disabled={updateProfile.isPending}
            />
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Ngày sinh</Label>
            <Input
              id="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={handleInputChange("date_of_birth")}
              disabled={updateProfile.isPending}
            />
            {errors.date_of_birth && (
              <p className="text-sm text-red-600">{errors.date_of_birth}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Giới tính</Label>
            <Select
              value={formData.gender}
              onValueChange={handleGenderChange}
              disabled={updateProfile.isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn giới tính" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Nam</SelectItem>
                <SelectItem value="female">Nữ</SelectItem>
                <SelectItem value="other">Khác</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={updateProfile.isPending}
          >
            {updateProfile.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang cập nhật...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Lưu thay đổi
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
