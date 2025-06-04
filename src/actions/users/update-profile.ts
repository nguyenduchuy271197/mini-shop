"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { Profile, ProfileUpdateDto } from "@/types/custom.types";

// Validation schema
const updateProfileSchema = z.object({
  full_name: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự").optional(),
  phone: z.string().regex(/^[0-9+\-\s()]+$/, "Số điện thoại không hợp lệ").optional().or(z.literal("")),
  avatar_url: z.string().url("URL avatar không hợp lệ").optional().or(z.literal("")),
  date_of_birth: z.string().refine((date) => {
    if (!date) return true;
    const parsedDate = new Date(date);
    const now = new Date();
    const age = now.getFullYear() - parsedDate.getFullYear();
    return age >= 13 && age <= 120;
  }, "Ngày sinh không hợp lệ").optional().or(z.literal("")),
  gender: z.enum(["male", "female", "other"]).optional(),
});

type UpdateProfileData = z.infer<typeof updateProfileSchema>;

// Return type
type UpdateProfileResult =
  | { success: true; message: string; profile: Profile }
  | { success: false; error: string };

export async function updateUserProfile(data: UpdateProfileData): Promise<UpdateProfileResult> {
  try {
    // 1. Validate input
    const validatedData = updateProfileSchema.parse(data);

    // 2. Create Supabase client
    const supabase = createClient();

    // 3. Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "Người dùng chưa đăng nhập",
      };
    }

    // 4. Prepare update data with proper typing
    const updateData: ProfileUpdateDto = {
      updated_at: new Date().toISOString(),
    };

    // Only update provided fields
    if (validatedData.full_name !== undefined) {
      updateData.full_name = validatedData.full_name;
    }
    if (validatedData.phone !== undefined) {
      updateData.phone = validatedData.phone || null;
    }
    if (validatedData.avatar_url !== undefined) {
      updateData.avatar_url = validatedData.avatar_url || null;
    }
    if (validatedData.date_of_birth !== undefined) {
      updateData.date_of_birth = validatedData.date_of_birth || null;
    }
    if (validatedData.gender !== undefined) {
      updateData.gender = validatedData.gender;
    }

    // 5. Update profile in database
    const { data: profile, error: updateError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id)
      .select()
      .single();

    if (updateError) {
      return {
        success: false,
        error: updateError.message || "Không thể cập nhật thông tin cá nhân",
      };
    }

    if (!profile) {
      return {
        success: false,
        error: "Không thể cập nhật thông tin cá nhân",
      };
    }

    return {
      success: true,
      message: "Cập nhật thông tin cá nhân thành công!",
      profile,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }

    return {
      success: false,
      error: "Đã xảy ra lỗi không mong muốn khi cập nhật thông tin cá nhân",
    };
  }
} 