"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { redirect } from "next/navigation";

// Validation schema
const resetPasswordSchema = z.object({
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  confirmPassword: z.string().min(1, "Xác nhận mật khẩu không được để trống"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

// Return type
type ResetPasswordResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function resetPassword(data: ResetPasswordData): Promise<ResetPasswordResult> {
  try {
    // 1. Validate input
    const validatedData = resetPasswordSchema.parse(data);

    // 2. Create Supabase client
    const supabase = createClient();

    // 3. Get current session (should be from email link)
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return {
        success: false,
        error: "Phiên đặt lại mật khẩu không hợp lệ hoặc đã hết hạn",
      };
    }

    // 4. Update user password
    const { error: updateError } = await supabase.auth.updateUser({
      password: validatedData.password,
    });

    if (updateError) {
      return {
        success: false,
        error: updateError.message || "Không thể cập nhật mật khẩu",
      };
    }

    return {
      success: true,
      message: "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.",
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
      error: "Đã xảy ra lỗi không mong muốn khi đặt lại mật khẩu",
    };
  }
}

// Alternative reset password function that redirects on success
export async function resetPasswordAndRedirect(data: ResetPasswordData): Promise<void> {
  const result = await resetPassword(data);
  
  if (result.success) {
    redirect("/auth/login?message=password-reset-success");
  }
  // If failed, let the calling component handle the error
}

// Function to verify reset token from URL
export async function verifyResetToken(): Promise<{ isValid: boolean; error?: string }> {
  try {
    const supabase = createClient();
    
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return {
        isValid: false,
        error: "Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn",
      };
    }

    return {
      isValid: true,
    };
  } catch  {
    return {
      isValid: false,
      error: "Không thể xác thực token đặt lại mật khẩu",
    };
  }
} 