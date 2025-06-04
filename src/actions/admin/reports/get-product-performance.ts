"use server";

import { createClient } from "@/lib/supabase/server";
import { PaginationParams } from "@/types/custom.types";
import { z } from "zod";

// Date range type
type DateRange = {
  startDate: string;
  endDate: string;
};

// Schema validation
const productPerformanceSchema = z.object({
  startDate: z.string().datetime("Ngày bắt đầu không hợp lệ"),
  endDate: z.string().datetime("Ngày kết thúc không hợp lệ"),
}).refine((data) => {
  return new Date(data.endDate) > new Date(data.startDate);
}, {
  message: "Ngày kết thúc phải sau ngày bắt đầu",
  path: ["endDate"]
});

type ProductPerformanceItem = {
  productId: number;
  productName: string;
  productSku: string | null;
  totalSold: number;
  totalRevenue: number;
  averagePrice: number;
  totalOrders: number;
  stockRemaining: number;
  conversionRate: number;
  refundedQuantity: number;
  refundedAmount: number;
};

type GetProductPerformanceResult =
  | { 
      success: true; 
      data: ProductPerformanceItem[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }
  | { success: false; error: string };

export async function getProductPerformanceReport(
  dateRange: DateRange,
  pagination?: PaginationParams
): Promise<GetProductPerformanceResult> {
  try {
    // Validate input
    const validatedData = productPerformanceSchema.parse(dateRange);

    const supabase = createClient();

    // Kiểm tra authentication
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "Người dùng chưa được xác thực",
      };
    }

    // Kiểm tra authorization - chỉ admin mới có thể xem báo cáo
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || userRole?.role !== "admin") {
      return {
        success: false,
        error: "Chỉ admin mới có thể xem báo cáo hiệu suất sản phẩm",
      };
    }

    // Thiết lập pagination
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const offset = (page - 1) * limit;

    // Lấy dữ liệu order items trong khoảng thời gian
    const { data: orderItemsData, error: orderItemsError } = await supabase
      .from("order_items")
      .select(`
        product_id,
        product_name,
        product_sku,
        quantity,
        unit_price,
        total_price,
        orders!inner (
          status,
          created_at
        )
      `)
      .gte("orders.created_at", validatedData.startDate)
      .lte("orders.created_at", validatedData.endDate);

    if (orderItemsError) {
      return {
        success: false,
        error: "Lỗi khi lấy dữ liệu order items",
      };
    }

    // Lấy thông tin sản phẩm và stock hiện tại
    const { data: productsData, error: productsError } = await supabase
      .from("products")
      .select("id, name, sku, stock_quantity");

    if (productsError) {
      return {
        success: false,
        error: "Lỗi khi lấy thông tin sản phẩm",
      };
    }

    // Tạo map để nhóm dữ liệu theo sản phẩm
    const productMap = new Map<number, ProductPerformanceItem>();
    const productStockMap = new Map<number, number>();

    // Map stock hiện tại
    productsData?.forEach(product => {
      productStockMap.set(product.id, product.stock_quantity);
    });

    // Xử lý dữ liệu order items
    orderItemsData?.forEach(item => {
      const productId = item.product_id;

      if (!productMap.has(productId)) {
        productMap.set(productId, {
          productId,
          productName: item.product_name,
          productSku: item.product_sku,
          totalSold: 0,
          totalRevenue: 0,
          averagePrice: 0,
          totalOrders: 0,
          stockRemaining: productStockMap.get(productId) || 0,
          conversionRate: 0,
          refundedQuantity: 0,
          refundedAmount: 0,
        });
      }

      const productData = productMap.get(productId)!;

      // Tính toán metrics dựa trên status đơn hàng
      if (item.orders && item.orders.status !== "cancelled") {
        productData.totalSold += item.quantity;
        productData.totalRevenue += item.total_price;
        productData.totalOrders += 1;
      }

      if (item.orders && item.orders.status === "refunded") {
        productData.refundedQuantity += item.quantity;
        productData.refundedAmount += item.total_price;
      }
    });

    // Tính average price và conversion rate
    productMap.forEach(productData => {
      if (productData.totalSold > 0) {
        productData.averagePrice = Math.round(productData.totalRevenue / productData.totalSold);
      }

      // Conversion rate = tỷ lệ sản phẩm được bán thành công vs bị refund
      const totalTransactions = productData.totalSold + productData.refundedQuantity;
      if (totalTransactions > 0) {
        productData.conversionRate = Math.round((productData.totalSold / totalTransactions) * 100);
      }
    });

    // Chuyển map thành array và sắp xếp theo revenue
    const allProductsData = Array.from(productMap.values()).sort((a, b) => 
      b.totalRevenue - a.totalRevenue
    );

    // Áp dụng pagination
    const total = allProductsData.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedData = allProductsData.slice(offset, offset + limit);

    return {
      success: true,
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
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
      error: "Đã xảy ra lỗi không mong muốn khi tạo báo cáo hiệu suất sản phẩm",
    };
  }
} 