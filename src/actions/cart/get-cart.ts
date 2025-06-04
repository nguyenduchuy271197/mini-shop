"use server";

import { createClient } from "@/lib/supabase/server";
import { CartItem, Product } from "@/types/custom.types";

// Extended cart item type with product info
type CartItemWithProduct = CartItem & {
  product?: Pick<Product, "id" | "name" | "slug" | "price" | "images" | "stock_quantity" | "is_active"> | null;
};

// Cart summary type
type CartSummary = {
  itemsCount: number;
  totalQuantity: number;
  subtotal: number;
  total: number;
};

// Return type
type GetCartResult =
  | { 
      success: true; 
      cartItems: CartItemWithProduct[];
      summary: CartSummary;
    }
  | { success: false; error: string };

export async function getCart(): Promise<GetCartResult> {
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
        error: "Bạn cần đăng nhập để xem giỏ hàng",
      };
    }

    // 3. Get cart items with product details
    const { data: cartItems, error: cartError } = await supabase
      .from("cart_items")
      .select(`
        *,
        product:products (
          id,
          name,
          slug,
          price,
          images,
          stock_quantity,
          is_active
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (cartError) {
      return {
        success: false,
        error: cartError.message || "Không thể lấy thông tin giỏ hàng",
      };
    }

    if (!cartItems) {
      return {
        success: true,
        cartItems: [],
        summary: {
          itemsCount: 0,
          totalQuantity: 0,
          subtotal: 0,
          total: 0,
        },
      };
    }

    // 4. Filter out items with inactive products and calculate totals
    const validCartItems: CartItemWithProduct[] = [];
    let totalQuantity = 0;
    let subtotal = 0;

    for (const item of cartItems) {
      // Check if product is still active and available
      if (item.product && item.product.is_active) {
        validCartItems.push(item);
        totalQuantity += item.quantity;
        subtotal += item.quantity * item.product.price;
      }
    }

    // 5. Calculate summary
    const summary: CartSummary = {
      itemsCount: validCartItems.length,
      totalQuantity,
      subtotal,
      total: subtotal, // Will be updated with discounts in calculate-cart-total
    };

    return {
      success: true,
      cartItems: validCartItems,
      summary,
    };
  } catch  {
    return {
      success: false,
      error: "Đã xảy ra lỗi không mong muốn khi lấy thông tin giỏ hàng",
    };
  }
} 