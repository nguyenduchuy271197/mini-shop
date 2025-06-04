"use server";

import { createClient } from "@/lib/supabase/server";
import { Product } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const reorderSchema = z.object({
  orderId: z.number().positive("ID đơn hàng không hợp lệ"),
});

type ReorderData = z.infer<typeof reorderSchema>;

// Reorder item info
type ReorderItemInfo = {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  available_stock: number;
  is_active: boolean;
  can_reorder: boolean;
  reason?: string;
};

// Return type
type ReorderResult =
  | { 
      success: true; 
      message: string; 
      items: ReorderItemInfo[];
      added_to_cart: number;
      unavailable_items: number;
    }
  | { success: false; error: string };

export async function reorderItems(data: ReorderData): Promise<ReorderResult> {
  try {
    // 1. Validate input
    const { orderId } = reorderSchema.parse(data);

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
        error: "Bạn cần đăng nhập để đặt lại đơn hàng",
      };
    }

    // 4. Get order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, user_id, order_number, status")
      .eq("id", orderId)
      .single();

    if (orderError) {
      if (orderError.code === "PGRST116") {
        return {
          success: false,
          error: "Không tìm thấy đơn hàng",
        };
      }
      return {
        success: false,
        error: orderError.message || "Không thể lấy thông tin đơn hàng",
      };
    }

    if (!order) {
      return {
        success: false,
        error: "Không tìm thấy đơn hàng",
      };
    }

    // 5. Authorization check - users can only reorder their own orders unless they're admin
    if (order.user_id !== user.id) {
      // Check if current user is admin
      const { data: userRole, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (roleError || !userRole || userRole.role !== "admin") {
        return {
          success: false,
          error: "Bạn không có quyền đặt lại đơn hàng này",
        };
      }
    }

    // 6. Get order items
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("product_id, product_name, quantity, unit_price")
      .eq("order_id", orderId);

    if (itemsError) {
      return {
        success: false,
        error: itemsError.message || "Không thể lấy thông tin sản phẩm trong đơn hàng",
      };
    }

    if (!orderItems || orderItems.length === 0) {
      return {
        success: false,
        error: "Đơn hàng không có sản phẩm nào để đặt lại",
      };
    }

    // 7. Check product availability
    const productIds = orderItems.map(item => item.product_id);
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, price, stock_quantity, is_active")
      .in("id", productIds);

    if (productsError) {
      return {
        success: false,
        error: productsError.message || "Không thể kiểm tra tình trạng sản phẩm",
      };
    }

    // Create products map for easy lookup
    const productsMap = new Map<number, Pick<Product, "id" | "name" | "price" | "stock_quantity" | "is_active">>();
    products?.forEach(product => {
      productsMap.set(product.id, product);
    });

    // 8. Analyze each item for reorder possibility
    const reorderItemsInfo: ReorderItemInfo[] = [];
    let addedToCart = 0;
    let unavailableItems = 0;

    for (const orderItem of orderItems) {
      const product = productsMap.get(orderItem.product_id);
      
      const itemInfo: ReorderItemInfo = {
        product_id: orderItem.product_id,
        product_name: orderItem.product_name,
        quantity: orderItem.quantity,
        unit_price: orderItem.unit_price,
        available_stock: product?.stock_quantity || 0,
        is_active: product?.is_active || false,
        can_reorder: false,
      };

      if (!product) {
        itemInfo.can_reorder = false;
        itemInfo.reason = "Sản phẩm không còn tồn tại";
        unavailableItems++;
      } else if (!product.is_active) {
        itemInfo.can_reorder = false;
        itemInfo.reason = "Sản phẩm đã ngừng kinh doanh";
        unavailableItems++;
      } else if (product.stock_quantity < orderItem.quantity) {
        itemInfo.can_reorder = false;
        itemInfo.reason = `Không đủ hàng tồn kho (chỉ còn ${product.stock_quantity})`;
        unavailableItems++;
      } else {
        itemInfo.can_reorder = true;
      }

      reorderItemsInfo.push(itemInfo);
    }

    // 9. Add available items to cart
    for (const itemInfo of reorderItemsInfo) {
      if (itemInfo.can_reorder) {
        // Check if item already exists in cart
        const { data: existingCartItem, error: cartCheckError } = await supabase
          .from("cart_items")
          .select("id, quantity")
          .eq("user_id", user.id)
          .eq("product_id", itemInfo.product_id)
          .single();

        if (cartCheckError && cartCheckError.code !== "PGRST116") {
          console.error("Error checking cart:", cartCheckError);
          continue;
        }

        if (existingCartItem) {
          // Update existing cart item quantity
          const newQuantity = Math.min(
            existingCartItem.quantity + itemInfo.quantity,
            itemInfo.available_stock
          );

          const { error: updateError } = await supabase
            .from("cart_items")
            .update({
              quantity: newQuantity,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingCartItem.id);

          if (!updateError) {
            addedToCart++;
          }
        } else {
          // Add new cart item
          const { error: insertError } = await supabase
            .from("cart_items")
            .insert({
              user_id: user.id,
              product_id: itemInfo.product_id,
              quantity: itemInfo.quantity,
            });

          if (!insertError) {
            addedToCart++;
          }
        }
      }
    }

    // 10. Prepare response message
    let message = "";
    if (addedToCart > 0 && unavailableItems === 0) {
      message = `Đã thêm tất cả ${addedToCart} sản phẩm vào giỏ hàng`;
    } else if (addedToCart > 0 && unavailableItems > 0) {
      message = `Đã thêm ${addedToCart} sản phẩm vào giỏ hàng. ${unavailableItems} sản phẩm không khả dụng`;
    } else if (addedToCart === 0 && unavailableItems > 0) {
      message = `Không thể đặt lại đơn hàng. Tất cả ${unavailableItems} sản phẩm đều không khả dụng`;
    } else {
      message = "Không có sản phẩm nào được thêm vào giỏ hàng";
    }

    return {
      success: true,
      message,
      items: reorderItemsInfo,
      added_to_cart: addedToCart,
      unavailable_items: unavailableItems,
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
      error: "Đã xảy ra lỗi không mong muốn khi đặt lại đơn hàng",
    };
  }
} 