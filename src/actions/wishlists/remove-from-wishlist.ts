"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schema
const removeFromWishlistSchema = z.object({
  productId: z.number().positive("ID sản phẩm không hợp lệ"),
});

type RemoveFromWishlistData = z.infer<typeof removeFromWishlistSchema>;

// Return type
type RemoveFromWishlistResult =
  | {
      success: true;
      message: string;
    }
  | { success: false; error: string };

export async function removeFromWishlist(data: RemoveFromWishlistData): Promise<RemoveFromWishlistResult> {
  try {
    // 1. Validate input
    const { productId } = removeFromWishlistSchema.parse(data);

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
        error: "Bạn cần đăng nhập để xóa sản phẩm khỏi danh sách yêu thích",
      };
    }

    // 4. Check if product exists in user's wishlist
    const { data: wishlistItem, error: checkError } = await supabase
      .from("wishlists")
      .select(`
        id,
        products!inner (
          id,
          name
        )
      `)
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .single();

    if (checkError) {
      if (checkError.code === "PGRST116") {
        return {
          success: false,
          error: "Sản phẩm không có trong danh sách yêu thích",
        };
      }
      return {
        success: false,
        error: checkError.message || "Không thể kiểm tra danh sách yêu thích",
      };
    }

    if (!wishlistItem) {
      return {
        success: false,
        error: "Sản phẩm không có trong danh sách yêu thích",
      };
    }

    // 5. Remove product from wishlist
    const { error: deleteError } = await supabase
      .from("wishlists")
      .delete()
      .eq("id", wishlistItem.id);

    if (deleteError) {
      return {
        success: false,
        error: deleteError.message || "Không thể xóa sản phẩm khỏi danh sách yêu thích",
      };
    }

    // Get product name for message
    const productName = Array.isArray(wishlistItem.products) 
      ? wishlistItem.products[0]?.name 
      : wishlistItem.products?.name || "Sản phẩm";

    return {
      success: true,
      message: `Đã xóa "${productName}" khỏi danh sách yêu thích`,
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
      error: "Đã xảy ra lỗi không mong muốn khi xóa sản phẩm khỏi danh sách yêu thích",
    };
  }
} 