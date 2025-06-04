"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schema
const removeFromCartSchema = z.object({
  cartItemId: z.number().positive("ID sản phẩm trong giỏ hàng không hợp lệ"),
});

type RemoveFromCartData = z.infer<typeof removeFromCartSchema>;

// Return type
type RemoveFromCartResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function removeFromCart(data: RemoveFromCartData): Promise<RemoveFromCartResult> {
  try {
    // 1. Validate input
    const { cartItemId } = removeFromCartSchema.parse(data);

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
        error: "Bạn cần đăng nhập để xóa sản phẩm khỏi giỏ hàng",
      };
    }

    // 4. Verify cart item exists and belongs to user
    const { data: existingCartItem, error: cartError } = await supabase
      .from("cart_items")
      .select("id")
      .eq("id", cartItemId)
      .eq("user_id", user.id)
      .single();

    if (cartError) {
      if (cartError.code === "PGRST116") {
        return {
          success: false,
          error: "Không tìm thấy sản phẩm trong giỏ hàng",
        };
      }
      return {
        success: false,
        error: cartError.message || "Không thể kiểm tra giỏ hàng",
      };
    }

    if (!existingCartItem) {
      return {
        success: false,
        error: "Không tìm thấy sản phẩm trong giỏ hàng",
      };
    }

    // 5. Delete cart item
    const { error: deleteError } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", cartItemId)
      .eq("user_id", user.id);

    if (deleteError) {
      return {
        success: false,
        error: deleteError.message || "Không thể xóa sản phẩm khỏi giỏ hàng",
      };
    }

    return {
      success: true,
      message: "Đã xóa sản phẩm khỏi giỏ hàng",
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
      error: "Đã xảy ra lỗi không mong muốn khi xóa sản phẩm khỏi giỏ hàng",
    };
  }
} 