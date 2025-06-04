"use server";

import { createClient } from "@/lib/supabase/server";
import { CartItem, Product } from "@/types/custom.types";
import { z } from "zod";

// Guest cart item type (from localStorage/session)
const guestCartItemSchema = z.object({
  productId: z.number().positive(),
  quantity: z.number().min(1).max(100),
});

const mergeGuestCartSchema = z.object({
  guestCartItems: z.array(guestCartItemSchema),
});

type MergeGuestCartData = z.infer<typeof mergeGuestCartSchema>;

// Extended cart item type with product info
type CartItemWithProduct = CartItem & {
  product?: Pick<Product, "id" | "name" | "price" | "stock_quantity" | "is_active"> | null;
};

// Merge result type
type MergeResult = {
  totalItems: number;
  mergedItems: number;
  updatedItems: number;
  skippedItems: number;
  cartItems: CartItemWithProduct[];
};

// Return type
type MergeGuestCartResult =
  | { success: true; message: string; result: MergeResult }
  | { success: false; error: string };

export async function mergeGuestCart(data: MergeGuestCartData): Promise<MergeGuestCartResult> {
  try {
    // 1. Validate input
    const { guestCartItems } = mergeGuestCartSchema.parse(data);

    if (guestCartItems.length === 0) {
      return {
        success: true,
        message: "Không có sản phẩm nào để đồng bộ",
        result: {
          totalItems: 0,
          mergedItems: 0,
          updatedItems: 0,
          skippedItems: 0,
          cartItems: [],
        },
      };
    }

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
        error: "Bạn cần đăng nhập để đồng bộ giỏ hàng",
      };
    }

    // 4. Get existing cart items for the user
    const { data: existingCartItems, error: cartError } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", user.id);

    if (cartError) {
      return {
        success: false,
        error: cartError.message || "Không thể lấy thông tin giỏ hàng hiện tại",
      };
    }

    // Create a map of existing cart items by product_id
    const existingCartMap = new Map<number, CartItem>();
    existingCartItems?.forEach(item => {
      existingCartMap.set(item.product_id, item);
    });

    // 5. Validate guest cart products exist and are active
    const productIds = guestCartItems.map(item => item.productId);
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, price, stock_quantity, is_active")
      .in("id", productIds);

    if (productsError) {
      return {
        success: false,
        error: productsError.message || "Không thể kiểm tra sản phẩm",
      };
    }

    // Create a map of valid products
    const productsMap = new Map<number, Pick<Product, "id" | "name" | "price" | "stock_quantity" | "is_active">>();
    products?.forEach(product => {
      if (product.is_active) {
        productsMap.set(product.id, product);
      }
    });

    // 6. Process guest cart items
    let mergedItems = 0;
    let updatedItems = 0;
    let skippedItems = 0;

    for (const guestItem of guestCartItems) {
      const product = productsMap.get(guestItem.productId);
      
      // Skip if product doesn't exist or is inactive
      if (!product) {
        skippedItems++;
        continue;
      }

      // Skip if not enough stock
      if (guestItem.quantity > product.stock_quantity) {
        skippedItems++;
        continue;
      }

      const existingItem = existingCartMap.get(guestItem.productId);

      if (existingItem) {
        // Update existing cart item quantity
        const newQuantity = Math.min(
          existingItem.quantity + guestItem.quantity,
          product.stock_quantity
        );

        const { error: updateError } = await supabase
          .from("cart_items")
          .update({
            quantity: newQuantity,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingItem.id);

        if (!updateError) {
          updatedItems++;
          // Update the map for potential future iterations
          existingCartMap.set(guestItem.productId, {
            ...existingItem,
            quantity: newQuantity,
          });
        } else {
          skippedItems++;
        }
      } else {
        // Create new cart item
        const { error: insertError } = await supabase
          .from("cart_items")
          .insert({
            user_id: user.id,
            product_id: guestItem.productId,
            quantity: guestItem.quantity,
          });

        if (!insertError) {
          mergedItems++;
        } else {
          skippedItems++;
        }
      }
    }

    // 7. Get updated cart items with product details
    const { data: updatedCartItems, error: updatedCartError } = await supabase
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
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (updatedCartError) {
      return {
        success: false,
        error: updatedCartError.message || "Không thể lấy giỏ hàng đã cập nhật",
      };
    }

    const result: MergeResult = {
      totalItems: guestCartItems.length,
      mergedItems,
      updatedItems,
      skippedItems,
      cartItems: updatedCartItems || [],
    };

    let message = "Đã đồng bộ giỏ hàng thành công";
    if (mergedItems > 0 || updatedItems > 0) {
      message += `. Đã thêm ${mergedItems} sản phẩm mới và cập nhật ${updatedItems} sản phẩm`;
    }
    if (skippedItems > 0) {
      message += `. ${skippedItems} sản phẩm không thể đồng bộ do hết hàng hoặc không tồn tại`;
    }

    return {
      success: true,
      message,
      result,
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
      error: "Đã xảy ra lỗi không mong muốn khi đồng bộ giỏ hàng",
    };
  }
} 