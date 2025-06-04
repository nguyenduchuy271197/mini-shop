"use server";

import { createClient } from "@/lib/supabase/server";
import { Wishlist } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const addToWishlistSchema = z.object({
  productId: z.number().positive("ID sản phẩm không hợp lệ"),
});

type AddToWishlistData = z.infer<typeof addToWishlistSchema>;

// Return type
type AddToWishlistResult =
  | {
      success: true;
      message: string;
      wishlistItem: Wishlist;
    }
  | { success: false; error: string };

export async function addToWishlist(data: AddToWishlistData): Promise<AddToWishlistResult> {
  try {
    // 1. Validate input
    const { productId } = addToWishlistSchema.parse(data);

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
        error: "Bạn cần đăng nhập để thêm sản phẩm vào danh sách yêu thích",
      };
    }

    // 4. Check if product exists and is active
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name, is_active")
      .eq("id", productId)
      .single();

    if (productError) {
      if (productError.code === "PGRST116") {
        return {
          success: false,
          error: "Không tìm thấy sản phẩm",
        };
      }
      return {
        success: false,
        error: productError.message || "Không thể kiểm tra sản phẩm",
      };
    }

    if (!product) {
      return {
        success: false,
        error: "Không tìm thấy sản phẩm",
      };
    }

    if (!product.is_active) {
      return {
        success: false,
        error: "Sản phẩm này hiện không có sẵn",
      };
    }

    // 5. Check if product is already in wishlist
    const { data: existingItem, error: checkError } = await supabase
      .from("wishlists")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      return {
        success: false,
        error: checkError.message || "Không thể kiểm tra danh sách yêu thích",
      };
    }

    if (existingItem) {
      return {
        success: false,
        error: "Sản phẩm đã có trong danh sách yêu thích",
      };
    }

    // 6. Add product to wishlist
    const { data: wishlistItem, error: insertError } = await supabase
      .from("wishlists")
      .insert({
        user_id: user.id,
        product_id: productId,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      return {
        success: false,
        error: insertError.message || "Không thể thêm sản phẩm vào danh sách yêu thích",
      };
    }

    if (!wishlistItem) {
      return {
        success: false,
        error: "Không thể thêm sản phẩm vào danh sách yêu thích",
      };
    }

    return {
      success: true,
      message: `Đã thêm "${product.name}" vào danh sách yêu thích`,
      wishlistItem,
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
      error: "Đã xảy ra lỗi không mong muốn khi thêm sản phẩm vào danh sách yêu thích",
    };
  }
} 