"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schema
const checkInWishlistSchema = z.object({
  productId: z.number().positive("ID sản phẩm không hợp lệ"),
});

type CheckInWishlistData = z.infer<typeof checkInWishlistSchema>;

// Return type
type CheckInWishlistResult =
  | {
      success: true;
      inWishlist: boolean;
      wishlistId?: number;
    }
  | { success: false; error: string };

export async function checkProductInWishlist(data: CheckInWishlistData): Promise<CheckInWishlistResult> {
  try {
    // 1. Validate input
    const { productId } = checkInWishlistSchema.parse(data);

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
        error: "Bạn cần đăng nhập để kiểm tra danh sách yêu thích",
      };
    }

    // 4. Check if product exists in user's wishlist
    const { data: wishlistItem, error: checkError } = await supabase
      .from("wishlists")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .single();

    if (checkError) {
      if (checkError.code === "PGRST116") {
        // Product not in wishlist
        return {
          success: true,
          inWishlist: false,
        };
      }
      return {
        success: false,
        error: checkError.message || "Không thể kiểm tra danh sách yêu thích",
      };
    }

    if (!wishlistItem) {
      return {
        success: true,
        inWishlist: false,
      };
    }

    return {
      success: true,
      inWishlist: true,
      wishlistId: wishlistItem.id,
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
      error: "Đã xảy ra lỗi không mong muốn khi kiểm tra danh sách yêu thích",
    };
  }
} 