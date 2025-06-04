"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

// Return type
type ForgotPasswordResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function forgotPassword(data: ForgotPasswordData): Promise<ForgotPasswordResult> {
  try {
    // 1. Validate input
    const validatedData = forgotPasswordSchema.parse(data);

    // 2. Create Supabase client
    const supabase = createClient();

    // 3. Check if user exists with this email
    const { data: existingUser, error: checkError } = await supabase
      .from("profiles")
      .select("email")
      .eq("email", validatedData.email)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      return {
        success: false,
        error: "Không thể kiểm tra email",
      };
    }

    if (!existingUser) {
      // Don't reveal if email exists or not for security
      return {
        success: true,
        message: "Nếu email tồn tại trong hệ thống, chúng tôi đã gửi link đặt lại mật khẩu đến email của bạn.",
      };
    }

    // 4. Send reset password email
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      validatedData.email,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
      }
    );

    if (resetError) {
      return {
        success: false,
        error: resetError.message || "Không thể gửi email đặt lại mật khẩu",
      };
    }

    return {
      success: true,
      message: "Chúng tôi đã gửi link đặt lại mật khẩu đến email của bạn. Vui lòng kiểm tra hộp thư và làm theo hướng dẫn.",
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
      error: "Đã xảy ra lỗi không mong muốn khi gửi email đặt lại mật khẩu",
    };
  }
} 