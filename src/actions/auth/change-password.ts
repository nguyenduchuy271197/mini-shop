"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schema
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Mật khẩu hiện tại không được để trống"),
  newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
  confirmPassword: z.string().min(1, "Xác nhận mật khẩu không được để trống"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

type ChangePasswordData = z.infer<typeof changePasswordSchema>;

// Return type
type ChangePasswordResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function changePassword(data: ChangePasswordData): Promise<ChangePasswordResult> {
  try {
    // 1. Validate input
    const validatedData = changePasswordSchema.parse(data);

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

    // 4. Verify current password by trying to sign in
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: validatedData.currentPassword,
    });

    if (verifyError) {
      return {
        success: false,
        error: "Mật khẩu hiện tại không chính xác",
      };
    }

    // 5. Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: validatedData.newPassword,
    });

    if (updateError) {
      return {
        success: false,
        error: updateError.message || "Không thể cập nhật mật khẩu",
      };
    }

    return {
      success: true,
      message: "Đổi mật khẩu thành công!",
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
      error: "Đã xảy ra lỗi không mong muốn khi đổi mật khẩu",
    };
  }
} 