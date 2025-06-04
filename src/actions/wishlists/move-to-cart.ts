"use server";

import { createClient } from "@/lib/supabase/server";
import { CartItem } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const moveToCartSchema = z.object({
  productId: z.number().positive("ID sản phẩm không hợp lệ"),
  quantity: z.number().positive("Số lượng phải lớn hơn 0").optional().default(1),
});

type MoveToCartData = z.infer<typeof moveToCartSchema>;

// Return type
type MoveToCartResult =
  | {
      success: true;
      message: string;
      cartItem: CartItem;
    }
  | { success: false; error: string };

export async function moveWishlistItemToCart(data: MoveToCartData): Promise<MoveToCartResult> {
  try {
    // 1. Validate input
    const { productId, quantity } = moveToCartSchema.parse(data);

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
        error: "Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng",
      };
    }

    // 4. Check if product exists in user's wishlist
    const { data: wishlistItem, error: wishlistError } = await supabase
      .from("wishlists")
      .select(`
        id,
        products!inner (
          id,
          name,
          price,
          compare_price,
          is_active,
          stock_quantity
        )
      `)
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .single();

    if (wishlistError) {
      if (wishlistError.code === "PGRST116") {
        return {
          success: false,
          error: "Sản phẩm không có trong danh sách yêu thích",
        };
      }
      return {
        success: false,
        error: wishlistError.message || "Không thể kiểm tra danh sách yêu thích",
      };
    }

    if (!wishlistItem || !wishlistItem.products) {
      return {
        success: false,
        error: "Sản phẩm không có trong danh sách yêu thích",
      };
    }

    const product = Array.isArray(wishlistItem.products) 
      ? wishlistItem.products[0] 
      : wishlistItem.products;

    // 5. Validate product availability
    if (!product.is_active) {
      return {
        success: false,
        error: "Sản phẩm này hiện không có sẵn",
      };
    }

    if (product.stock_quantity < quantity) {
      return {
        success: false,
        error: `Chỉ còn ${product.stock_quantity} sản phẩm trong kho`,
      };
    }

    // 6. Check if product is already in cart
    const { data: existingCartItem, error: cartCheckError } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .single();

    if (cartCheckError && cartCheckError.code !== "PGRST116") {
      return {
        success: false,
        error: cartCheckError.message || "Không thể kiểm tra giỏ hàng",
      };
    }

    let cartItem: CartItem;

    if (existingCartItem) {
      // 7a. Update existing cart item
      const newQuantity = existingCartItem.quantity + quantity;
      
      if (newQuantity > product.stock_quantity) {
        return {
          success: false,
          error: `Tổng số lượng (${newQuantity}) vượt quá số lượng tồn kho (${product.stock_quantity})`,
        };
      }

      const { data: updatedCartItem, error: updateError } = await supabase
        .from("cart_items")
        .update({
          quantity: newQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingCartItem.id)
        .select()
        .single();

      if (updateError || !updatedCartItem) {
        return {
          success: false,
          error: updateError?.message || "Không thể cập nhật giỏ hàng",
        };
      }

      cartItem = updatedCartItem;
    } else {
      // 7b. Create new cart item
      const { data: newCartItem, error: insertError } = await supabase
        .from("cart_items")
        .insert({
          user_id: user.id,
          product_id: productId,
          quantity,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError || !newCartItem) {
        return {
          success: false,
          error: insertError?.message || "Không thể thêm sản phẩm vào giỏ hàng",
        };
      }

      cartItem = newCartItem;
    }

    // 8. Remove item from wishlist
    const { error: removeError } = await supabase
      .from("wishlists")
      .delete()
      .eq("id", wishlistItem.id);

    if (removeError) {
      console.error("Error removing from wishlist:", removeError);
      // Don't fail the operation, just log the error
    }

    return {
      success: true,
      message: `Đã chuyển "${product.name}" từ danh sách yêu thích vào giỏ hàng`,
      cartItem,
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
      error: "Đã xảy ra lỗi không mong muốn khi chuyển sản phẩm vào giỏ hàng",
    };
  }
} 