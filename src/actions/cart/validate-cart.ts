"use server";

import { createClient } from "@/lib/supabase/server";
import { CartItem, Product } from "@/types/custom.types";

// Validation issue type
type CartValidationIssue = {
  cartItemId: number;
  productId: number;
  productName: string;
  issue: "out_of_stock" | "insufficient_stock" | "product_inactive" | "product_deleted";
  message: string;
  currentStock?: number;
  requestedQuantity?: number;
};

// Extended cart item type with product info
type CartItemWithProduct = CartItem & {
  product?: Pick<Product, "id" | "name" | "price" | "stock_quantity" | "is_active"> | null;
};

// Return type
type ValidateCartResult =
  | { 
      success: true; 
      isValid: boolean;
      issues: CartValidationIssue[];
      validItems: CartItemWithProduct[];
    }
  | { success: false; error: string };

export async function validateCart(): Promise<ValidateCartResult> {
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
        error: "Bạn cần đăng nhập để kiểm tra giỏ hàng",
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
          price,
          stock_quantity,
          is_active
        )
      `)
      .eq("user_id", user.id);

    if (cartError) {
      return {
        success: false,
        error: cartError.message || "Không thể lấy thông tin giỏ hàng",
      };
    }

    if (!cartItems || cartItems.length === 0) {
      return {
        success: true,
        isValid: true,
        issues: [],
        validItems: [],
      };
    }

    // 4. Validate each cart item
    const issues: CartValidationIssue[] = [];
    const validItems: CartItemWithProduct[] = [];

    for (const item of cartItems) {
      const product = item.product;

      // Check if product exists
      if (!product) {
        issues.push({
          cartItemId: item.id,
          productId: item.product_id,
          productName: "Sản phẩm không xác định",
          issue: "product_deleted",
          message: "Sản phẩm đã bị xóa khỏi hệ thống",
        });
        continue;
      }

      // Check if product is active
      if (!product.is_active) {
        issues.push({
          cartItemId: item.id,
          productId: product.id,
          productName: product.name,
          issue: "product_inactive",
          message: "Sản phẩm đã ngừng kinh doanh",
        });
        continue;
      }

      // Check stock availability
      if (product.stock_quantity === 0) {
        issues.push({
          cartItemId: item.id,
          productId: product.id,
          productName: product.name,
          issue: "out_of_stock",
          message: "Sản phẩm đã hết hàng",
          currentStock: product.stock_quantity,
          requestedQuantity: item.quantity,
        });
        continue;
      }

      // Check sufficient stock
      if (item.quantity > product.stock_quantity) {
        issues.push({
          cartItemId: item.id,
          productId: product.id,
          productName: product.name,
          issue: "insufficient_stock",
          message: `Không đủ hàng tồn kho. Chỉ còn ${product.stock_quantity} sản phẩm`,
          currentStock: product.stock_quantity,
          requestedQuantity: item.quantity,
        });
        continue;
      }

      // Item is valid
      validItems.push(item);
    }

    // 5. Remove invalid items from cart (optional - you might want to keep them for user review)
    const invalidCartItemIds = issues
      .filter(issue => issue.issue === "product_deleted" || issue.issue === "product_inactive")
      .map(issue => issue.cartItemId);

    if (invalidCartItemIds.length > 0) {
      await supabase
        .from("cart_items")
        .delete()
        .in("id", invalidCartItemIds)
        .eq("user_id", user.id);
    }

    return {
      success: true,
      isValid: issues.length === 0,
      issues,
      validItems,
    };
  } catch  {
    return {
      success: false,
      error: "Đã xảy ra lỗi không mong muốn khi kiểm tra giỏ hàng",
    };
  }
} 