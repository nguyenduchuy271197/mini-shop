"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schema
const registerSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
});

type RegisterData = z.infer<typeof registerSchema>;

// Return type
type RegisterResult =
  | { success: true; message: string; userId: string }
  | { success: false; error: string };

export async function registerUser(data: RegisterData): Promise<RegisterResult> {
  try {
    // 1. Validate input
    const validatedData = registerSchema.parse(data);

    // 2. Create Supabase client
    const supabase = createClient();

    // 3. Create user account (Supabase will handle email uniqueness check)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          full_name: validatedData.fullName,
        },
      },
    });

    if (authError) {
      // Handle specific error cases
      if (authError.message.includes("already registered") || authError.message.includes("already exists")) {
        return {
          success: false,
          error: "Email đã được sử dụng",
        };
      }
      
      return {
        success: false,
        error: authError.message || "Không thể tạo tài khoản",
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: "Không thể tạo tài khoản",
      };
    }

    return {
      success: true,
      message: "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
      userId: authData.user.id,
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
      error: "Đã xảy ra lỗi không mong muốn khi đăng ký",
    };
  }
} 