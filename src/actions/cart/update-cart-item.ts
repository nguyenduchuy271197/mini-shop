"use server";

import { createClient } from "@/lib/supabase/server";
import { CartItem, Product } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const updateCartItemSchema = z.object({
  cartItemId: z.number().positive("ID sản phẩm trong giỏ hàng không hợp lệ"),
  quantity: z.number().min(1, "Số lượng phải lớn hơn 0").max(100, "Số lượng tối đa là 100"),
});

type UpdateCartItemData = z.infer<typeof updateCartItemSchema>;

// Extended cart item type with product info
type CartItemWithProduct = CartItem & {
  product?: Pick<Product, "id" | "name" | "price" | "stock_quantity" | "is_active"> | null;
};

// Return type
type UpdateCartItemResult =
  | { success: true; message: string; cartItem: CartItemWithProduct }
  | { success: false; error: string };

export async function updateCartItem(data: UpdateCartItemData): Promise<UpdateCartItemResult> {
  try {
    // 1. Validate input
    const { cartItemId, quantity } = updateCartItemSchema.parse(data);

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
        error: "Bạn cần đăng nhập để cập nhật giỏ hàng",
      };
    }

    // 4. Get existing cart item and verify ownership
    const { data: existingCartItem, error: cartError } = await supabase
      .from("cart_items")
      .select("*")
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

    // 5. Get product info to check stock
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name, price, stock_quantity, is_active")
      .eq("id", existingCartItem.product_id)
      .eq("is_active", true)
      .single();

    if (productError) {
      if (productError.code === "PGRST116") {
        return {
          success: false,
          error: "Sản phẩm không tồn tại hoặc đã ngừng bán",
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

    // 6. Check stock availability
    if (quantity > product.stock_quantity) {
      return {
        success: false,
        error: `Không đủ hàng tồn kho. Chỉ còn ${product.stock_quantity} sản phẩm`,
      };
    }

    // 7. Update cart item
    const { data: updatedCartItem, error: updateError } = await supabase
      .from("cart_items")
      .update({
        quantity,
        updated_at: new Date().toISOString(),
      })
      .eq("id", cartItemId)
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

    // 8. Return success with updated cart item and product info
    const cartItemWithProduct: CartItemWithProduct = {
      ...updatedCartItem,
      product,
    };

    return {
      success: true,
      message: "Đã cập nhật số lượng sản phẩm trong giỏ hàng",
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
      error: "Đã xảy ra lỗi không mong muốn khi cập nhật giỏ hàng",
    };
  }
} 