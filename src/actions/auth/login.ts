"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { redirect } from "next/navigation";

// Validation schema
const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Mật khẩu không được để trống"),
});

type LoginData = z.infer<typeof loginSchema>;

// Return type
type LoginResult =
  | { success: true; message: string; redirectTo?: string }
  | { success: false; error: string };

export async function loginUser(data: LoginData): Promise<LoginResult> {
  try {
    // 1. Validate input
    const validatedData = loginSchema.parse(data);

    // 2. Create Supabase client
    const supabase = createClient();

    // 3. Attempt to sign in
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (authError) {
      return {
        success: false,
        error: authError.message === "Invalid login credentials" 
          ? "Email hoặc mật khẩu không chính xác"
          : authError.message || "Không thể đăng nhập",
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: "Không thể đăng nhập",
      };
    }

    // 4. Get user profile and role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    // 5. Determine redirect path based on role
    let redirectTo = "/";
    
    if (!profileError && profile) {
      // Get user role from user_roles table
      const { data: userRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", authData.user.id)
        .eq("role", "admin")
        .single();

      if (userRole) {
        redirectTo = "/admin/dashboard";
      } else {
        redirectTo = "/dashboard";
      }
    }

    return {
      success: true,
      message: "Đăng nhập thành công!",
      redirectTo,
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
      error: "Đã xảy ra lỗi không mong muốn khi đăng nhập",
    };
  }
}

// Alternative login function that redirects directly
export async function loginAndRedirect(data: LoginData): Promise<void> {
  const result = await loginUser(data);
  
  if (result.success && result.redirectTo) {
    redirect(result.redirectTo);
  } else if (result.success) {
    redirect("/dashboard");
  }
  // If failed, let the calling component handle the error
} 