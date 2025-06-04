"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { redirect } from "next/navigation";

// Validation schema
const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token xác thực không được để trống"),
});

type VerifyEmailData = z.infer<typeof verifyEmailSchema>;

// Return type
type VerifyEmailResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function verifyEmail(data: VerifyEmailData): Promise<VerifyEmailResult> {
  try {
    // 1. Validate input
    const validatedData = verifyEmailSchema.parse(data);

    // 2. Create Supabase client
    const supabase = createClient();

    // 3. Verify the email token
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: validatedData.token,
      type: "email",
    });

    if (verifyError) {
      return {
        success: false,
        error: verifyError.message === "Token has expired or is invalid"
          ? "Token xác thực không hợp lệ hoặc đã hết hạn"
          : verifyError.message || "Không thể xác thực email",
      };
    }

    return {
      success: true,
      message: "Xác thực email thành công! Tài khoản của bạn đã được kích hoạt.",
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
      error: "Đã xảy ra lỗi không mong muốn khi xác thực email",
    };
  }
}

// Alternative verify email function that redirects on success
export async function verifyEmailAndRedirect(data: VerifyEmailData): Promise<void> {
  const result = await verifyEmail(data);
  
  if (result.success) {
    redirect("/auth/login?message=email-verified");
  } else {
    redirect("/auth/login?message=email-verification-failed");
  }
}

// Function to resend verification email
export async function resendVerificationEmail(email: string): Promise<VerifyEmailResult> {
  try {
    // 1. Validate email
    const emailSchema = z.string().email("Email không hợp lệ");
    const validatedEmail = emailSchema.parse(email);

    // 2. Create Supabase client
    const supabase = createClient();

    // 3. Check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from("profiles")
      .select("email")
      .eq("email", validatedEmail)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      return {
        success: false,
        error: "Không thể kiểm tra email",
      };
    }

    if (!existingUser) {
      // Don't reveal if email exists for security
      return {
        success: true,
        message: "Nếu email tồn tại trong hệ thống, chúng tôi đã gửi lại email xác thực.",
      };
    }

    // 4. Resend verification email
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email: validatedEmail,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/verify-email`,
      },
    });

    if (resendError) {
      return {
        success: false,
        error: resendError.message || "Không thể gửi lại email xác thực",
      };
    }

    return {
      success: true,
      message: "Chúng tôi đã gửi lại email xác thực. Vui lòng kiểm tra hộp thư và làm theo hướng dẫn.",
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
      error: "Đã xảy ra lỗi không mong muốn khi gửi lại email xác thực",
    };
  }
}

// Function to check email verification status
export async function checkEmailVerificationStatus(): Promise<{
  isVerified: boolean;
  email?: string;
  error?: string;
}> {
  try {
    const supabase = createClient();
    
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        isVerified: false,
        error: "Người dùng chưa đăng nhập",
      };
    }

    return {
      isVerified: user.email_confirmed_at !== null,
      email: user.email,
    };
  } catch  {
    return {
      isVerified: false,
      error: "Không thể kiểm tra trạng thái xác thực email",
    };
  }
} 