"use server";

import { createClient } from "@/lib/supabase/server";

// Return type
type ClearCartResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function clearCart(): Promise<ClearCartResult> {
  try {
    // 1. Create Supabase client
    const supabase = createClient();

    // 2. Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "Bạn cần đăng nhập để xóa giỏ hàng",
      };
    }

    // 3. Delete all cart items for the user
    const { error: deleteError } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id);

    if (deleteError) {
      return {
        success: false,
        error: deleteError.message || "Không thể xóa giỏ hàng",
      };
    }

    return {
      success: true,
      message: "Đã xóa tất cả sản phẩm khỏi giỏ hàng",
    };
  } catch {
    return {
      success: false,
      error: "Đã xảy ra lỗi không mong muốn khi xóa giỏ hàng",
    };
  }
} 

// System function to clear cart for specific user (used by payment confirmations)
export async function clearCartForUser(userId: string): Promise<ClearCartResult> {
  try {
    // 1. Create Supabase client with service role
    const supabase = createClient();

    // 2. Delete all cart items for the specified user
    const { error: deleteError } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", userId);

    if (deleteError) {
      return {
        success: false,
        error: deleteError.message || "Không thể xóa giỏ hàng",
      };
    }

    return {
      success: true,
      message: "Đã xóa tất cả sản phẩm khỏi giỏ hàng",
    };
  } catch {
    return {
      success: false,
      error: "Đã xảy ra lỗi không mong muốn khi xóa giỏ hàng",
    };
  }
} 