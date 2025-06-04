"use server";

import { createClient } from "@/lib/supabase/server";
import { CartItem, Product } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const addToCartSchema = z.object({
  productId: z.number().positive("ID sản phẩm không hợp lệ"),
  quantity: z.number().min(1, "Số lượng phải lớn hơn 0").max(100, "Số lượng tối đa là 100"),
});

type AddToCartData = z.infer<typeof addToCartSchema>;

// Extended cart item type with product info
type CartItemWithProduct = CartItem & {
  product?: Pick<Product, "id" | "name" | "price" | "stock_quantity" | "is_active"> | null;
};

// Return type
type AddToCartResult =
  | { success: true; message: string; cartItem: CartItemWithProduct }
  | { success: false; error: string };

export async function addToCart(data: AddToCartData): Promise<AddToCartResult> {
  try {
    // 1. Validate input
    const { productId, quantity } = addToCartSchema.parse(data);

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

    // 4. Validate product exists and is active
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name, price, stock_quantity, is_active")
      .eq("id", productId)
      .eq("is_active", true)
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
        error: "Sản phẩm không tồn tại hoặc đã ngừng bán",
      };
    }

    // 5. Check stock availability
    if (product.stock_quantity < quantity) {
      return {
        success: false,
        error: `Không đủ hàng tồn kho. Chỉ còn ${product.stock_quantity} sản phẩm`,
      };
    }

    // 6. Check if item already exists in cart
    const { data: existingCartItem, error: existingError } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .single();

    if (existingError && existingError.code !== "PGRST116") {
      return {
        success: false,
        error: "Không thể kiểm tra giỏ hàng",
      };
    }

    let cartItem: CartItem;

    if (existingCartItem) {
      // 7a. Update existing cart item
      const newQuantity = existingCartItem.quantity + quantity;

      // Check total quantity against stock
      if (newQuantity > product.stock_quantity) {
        return {
          success: false,
          error: `Không thể thêm ${quantity} sản phẩm. Tổng số lượng sẽ vượt quá hàng tồn kho (${product.stock_quantity})`,
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

      if (updateError) {
        return {
          success: false,
          error: updateError.message || "Không thể cập nhật giỏ hàng",
        };
      }

      if (!updatedCartItem) {
        return {
          success: false,
          error: "Không thể cập nhật giỏ hàng",
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
        })
        .select()
        .single();

      if (insertError) {
        return {
          success: false,
          error: insertError.message || "Không thể thêm sản phẩm vào giỏ hàng",
        };
      }

      if (!newCartItem) {
        return {
          success: false,
          error: "Không thể thêm sản phẩm vào giỏ hàng",
        };
      }

      cartItem = newCartItem;
    }

    // 8. Return success with cart item and product info
    const cartItemWithProduct: CartItemWithProduct = {
      ...cartItem,
      product,
    };

    return {
      success: true,
      message: existingCartItem 
        ? "Đã cập nhật số lượng sản phẩm trong giỏ hàng" 
        : "Đã thêm sản phẩm vào giỏ hàng",
      cartItem: cartItemWithProduct,
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
      error: "Đã xảy ra lỗi không mong muốn khi thêm sản phẩm vào giỏ hàng",
    };
  }
} 