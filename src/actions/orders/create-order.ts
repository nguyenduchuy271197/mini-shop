"use server";

import { createClient } from "@/lib/supabase/server";
import { Order, OrderItem, Product } from "@/types/custom.types";
import { z } from "zod";

// Validation schema for address
const addressSchema = z.object({
  first_name: z.string().min(1, "Tên không được để trống"),
  last_name: z.string().min(1, "Họ không được để trống"),
  company: z.string().optional(),
  address_line_1: z.string().min(1, "Địa chỉ không được để trống"),
  address_line_2: z.string().optional(),
  city: z.string().min(1, "Thành phố không được để trống"),
  state: z.string().min(1, "Tỉnh/Bang không được để trống"),
  postal_code: z.string().min(1, "Mã bưu chính không được để trống"),
  country: z.string().min(1, "Quốc gia không được để trống"),
  phone: z.string().optional(),
});

// Validation schema for create order
const createOrderSchema = z.object({
  shipping_address: addressSchema,
  billing_address: addressSchema,
  shipping_method: z.string().min(1, "Phương thức vận chuyển không được để trống"),
  coupon_code: z.string().optional(),
  notes: z.string().optional(),
  // Optional: if provided, create order from these items instead of cart
  order_items: z.array(z.object({
    product_id: z.number().positive(),
    quantity: z.number().min(1).max(100),
  })).optional(),
});

type CreateOrderData = z.infer<typeof createOrderSchema>;

// Extended order type with items
type OrderWithItems = Order & {
  order_items: Array<OrderItem & {
    product?: Pick<Product, "id" | "name" | "price"> | null;
  }>;
};

// Return type
type CreateOrderResult =
  | { success: true; message: string; order: OrderWithItems }
  | { success: false; error: string };

export async function createOrder(data: CreateOrderData): Promise<CreateOrderResult> {
  try {
    // 1. Validate input
    const validatedData = createOrderSchema.parse(data);

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
        error: "Bạn cần đăng nhập để tạo đơn hàng",
      };
    }

    // 4. Get items to order (from cart or provided items)
    let itemsToOrder: Array<{ product_id: number; quantity: number }> = [];

    if (validatedData.order_items) {
      // Use provided items
      itemsToOrder = validatedData.order_items;
    } else {
      // Get items from cart
      const { data: cartItems, error: cartError } = await supabase
        .from("cart_items")
        .select("product_id, quantity")
        .eq("user_id", user.id);

      if (cartError) {
        return {
          success: false,
          error: cartError.message || "Không thể lấy thông tin giỏ hàng",
        };
      }

      if (!cartItems || cartItems.length === 0) {
        return {
          success: false,
          error: "Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi đặt hàng",
        };
      }

      itemsToOrder = cartItems;
    }

    // 5. Validate products and calculate totals
    const productIds = itemsToOrder.map(item => item.product_id);
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, price, stock_quantity, is_active")
      .in("id", productIds)
      .eq("is_active", true);

    if (productsError) {
      return {
        success: false,
        error: productsError.message || "Không thể kiểm tra sản phẩm",
      };
    }

    if (!products || products.length !== productIds.length) {
      return {
        success: false,
        error: "Một số sản phẩm không tồn tại hoặc đã ngừng bán",
      };
    }

    // Check stock and calculate subtotal
    let subtotal = 0;
    const orderItemsData: Array<{
      product_id: number;
      product_name: string;
      product_sku: string | null;
      quantity: number;
      unit_price: number;
      total_price: number;
    }> = [];

    for (const item of itemsToOrder) {
      const product = products.find(p => p.id === item.product_id);
      if (!product) {
        return {
          success: false,
          error: `Sản phẩm với ID ${item.product_id} không tồn tại`,
        };
      }

      if (item.quantity > product.stock_quantity) {
        return {
          success: false,
          error: `Không đủ hàng tồn kho cho sản phẩm ${product.name}. Chỉ còn ${product.stock_quantity} sản phẩm`,
        };
      }

      const itemTotal = item.quantity * product.price;
      subtotal += itemTotal;

      orderItemsData.push({
        product_id: product.id,
        product_name: product.name,
        product_sku: null, // Add SKU if available in your product schema
        quantity: item.quantity,
        unit_price: product.price,
        total_price: itemTotal,
      });
    }

    // 6. Apply coupon if provided
    let discountAmount = 0;
    let couponId: number | null = null;

    if (validatedData.coupon_code) {
      const { data: coupon, error: couponError } = await supabase
        .from("coupons")
        .select("id, type, value, minimum_amount, maximum_discount, usage_limit, used_count, is_active, starts_at, expires_at")
        .eq("code", validatedData.coupon_code.toUpperCase())
        .eq("is_active", true)
        .single();

      if (couponError && couponError.code !== "PGRST116") {
        return {
          success: false,
          error: "Không thể kiểm tra mã giảm giá",
        };
      }

      if (!coupon) {
        return {
          success: false,
          error: "Mã giảm giá không hợp lệ hoặc đã hết hạn",
        };
      }

      // Validate coupon conditions
      const now = new Date();
      const startsAt = new Date(coupon.starts_at);
      const expiresAt = coupon.expires_at ? new Date(coupon.expires_at) : null;

      if (now < startsAt) {
        return {
          success: false,
          error: "Mã giảm giá chưa có hiệu lực",
        };
      }

      if (expiresAt && now > expiresAt) {
        return {
          success: false,
          error: "Mã giảm giá đã hết hạn",
        };
      }

      if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        return {
          success: false,
          error: "Mã giảm giá đã hết lượt sử dụng",
        };
      }

      if (coupon.minimum_amount && subtotal < coupon.minimum_amount) {
        return {
          success: false,
          error: `Đơn hàng tối thiểu ${coupon.minimum_amount.toLocaleString('vi-VN')}₫ để sử dụng mã giảm giá`,
        };
      }

      // Calculate discount
      if (coupon.type === "percentage") {
        discountAmount = (subtotal * coupon.value) / 100;
        if (coupon.maximum_discount && discountAmount > coupon.maximum_discount) {
          discountAmount = coupon.maximum_discount;
        }
      } else if (coupon.type === "fixed_amount") {
        discountAmount = Math.min(coupon.value, subtotal);
      }

      couponId = coupon.id;
    }

    // 7. Calculate final amounts
    const taxAmount = 0; // Add tax calculation logic if needed
    const shippingAmount = 0; // Add shipping calculation logic if needed
    const totalAmount = subtotal + taxAmount + shippingAmount - discountAmount;

    // 8. Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // 9. Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        status: "pending",
        payment_status: "pending",
        subtotal,
        tax_amount: taxAmount,
        shipping_amount: shippingAmount,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        shipping_method: validatedData.shipping_method,
        shipping_address: validatedData.shipping_address,
        billing_address: validatedData.billing_address,
        coupon_id: couponId,
        coupon_code: validatedData.coupon_code?.toUpperCase(),
        notes: validatedData.notes,
      })
      .select()
      .single();

    if (orderError) {
      return {
        success: false,
        error: orderError.message || "Không thể tạo đơn hàng",
      };
    }

    if (!order) {
      return {
        success: false,
        error: "Không thể tạo đơn hàng",
      };
    }

    // 10. Create order items
    const orderItemsWithOrderId = orderItemsData.map(item => ({
      ...item,
      order_id: order.id,
    }));

    const { data: createdOrderItems, error: orderItemsError } = await supabase
      .from("order_items")
      .insert(orderItemsWithOrderId)
      .select();

    if (orderItemsError) {
      // Rollback order creation
      await supabase.from("orders").delete().eq("id", order.id);
      return {
        success: false,
        error: orderItemsError.message || "Không thể tạo chi tiết đơn hàng",
      };
    }

    // 11. Update product stock
    for (const item of itemsToOrder) {
      const product = products.find(p => p.id === item.product_id)!;
      await supabase
        .from("products")
        .update({
          stock_quantity: product.stock_quantity - item.quantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", product.id);
    }

    // 12. DO NOT clear cart here - only clear after payment confirmation
    // This allows users to return to cart if they cancel payment
    // Cart will be cleared by webhook when payment is successful

    // 13. Update coupon usage count
    if (couponId) {
      const { data: coupon } = await supabase
        .from("coupons")
        .select("used_count")
        .eq("id", couponId)
        .single();

      if (coupon) {
        await supabase
          .from("coupons")
          .update({
            used_count: coupon.used_count + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", couponId);
      }
    }

    // 14. Prepare response with order items and product info
    const orderWithItems: OrderWithItems = {
      ...order,
      order_items: createdOrderItems?.map(item => ({
        ...item,
        product: products.find(p => p.id === item.product_id) || null,
      })) || [],
    };

    return {
      success: true,
      message: "Đặt hàng thành công",
      order: orderWithItems,
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
      error: "Đã xảy ra lỗi không mong muốn khi tạo đơn hàng",
    };
  }
} 