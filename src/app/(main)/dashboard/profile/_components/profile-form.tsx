"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, Save } from "lucide-react";
import { useProfile, useUpdateProfile } from "@/hooks/users";
import { GenderType } from "@/types/custom.types";

// Validation schema
const profileFormSchema = z.object({
  full_name: z
    .string()
    .min(2, "Họ tên phải có ít nhất 2 ký tự")
    .max(50, "Họ tên không được quá 50 ký tự"),
  phone: z
    .string()
    .regex(/^[0-9+\-\s()]*$/, "Số điện thoại không hợp lệ")
    .optional(),
  date_of_birth: z
    .string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      const parsedDate = new Date(date);
      const now = new Date();
      const age = now.getFullYear() - parsedDate.getFullYear();
      return !isNaN(parsedDate.getTime()) && age >= 13 && age <= 120;
    }, "Ngày sinh không hợp lệ"),
  gender: z
    .string()
    .optional()
    .refine(
      (value) => !value || ["male", "female", "other"].includes(value),
      "Giới tính không hợp lệ"
    ),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

export default function ProfileForm() {
  const { data: profileData, isLoading: isLoadingProfile } = useProfile();
  const updateProfile = useUpdateProfile();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      date_of_birth: "",
      gender: "",
    },
  });

  // Load profile data when available
  useEffect(() => {
    if (profileData?.success && profileData.profile) {
      const profile = profileData.profile;
      form.reset({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        date_of_birth: profile.date_of_birth || "",
        gender: (profile.gender as GenderType) || "",
      });
    }
  }, [profileData, form]);

  const onSubmit = async (data: ProfileFormData) => {
    // Only send non-empty values
    const updateData: {
      full_name?: string;
      phone?: string;
      date_of_birth?: string;
      gender?: GenderType;
    } = {};

    if (data.full_name?.trim()) {
      updateData.full_name = data.full_name.trim();
    }
    if (data.phone?.trim()) {
      updateData.phone = data.phone.trim();
    }
    if (data.date_of_birth?.trim()) {
      updateData.date_of_birth = data.date_of_birth;
    }
    if (
      data.gender?.trim() &&
      ["male", "female", "other"].includes(data.gender)
    ) {
      updateData.gender = data.gender as GenderType;
    }

    updateProfile.mutate(updateData);
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ và tên *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập họ và tên của bạn"
                      disabled={updateProfile.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số điện thoại</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="Nhập số điện thoại"
                      disabled={updateProfile.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date_of_birth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngày sinh</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      disabled={updateProfile.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giới tính</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={updateProfile.isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn giới tính" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Nam</SelectItem>
                      <SelectItem value="female">Nữ</SelectItem>
                      <SelectItem value="other">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
        </Form>
      </CardContent>
    </Card>
  );
}
