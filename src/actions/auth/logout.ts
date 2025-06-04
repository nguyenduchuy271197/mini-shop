"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Return type
type LogoutResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function logoutUser(): Promise<LogoutResult> {
  try {
    // 1. Create Supabase client
    const supabase = createClient();

    // 2. Check if user is authenticated
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

    // 3. Sign out
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      return {
        success: false,
        error: signOutError.message || "Không thể đăng xuất",
      };
    }

    return {
      success: true,
      message: "Đăng xuất thành công!",
    };
  } catch  {
    return {
      success: false,
      error: "Đã xảy ra lỗi không mong muốn khi đăng xuất",
    };
  }
}

// Alternative logout function that redirects directly
export async function logoutAndRedirect(): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.auth.signOut();
  } catch (error) {
    // Log error but still redirect
    console.error("Lỗi khi đăng xuất:", error);
  }
  
  redirect("/auth/login");
} 