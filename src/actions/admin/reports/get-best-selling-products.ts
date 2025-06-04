"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Date range type
type DateRange = {
  startDate: string;
  endDate: string;
};

// Schema validation
const bestSellingProductsSchema = z.object({
  startDate: z.string().datetime("Ngày bắt đầu không hợp lệ"),
  endDate: z.string().datetime("Ngày kết thúc không hợp lệ"),
}).refine((data) => {
  return new Date(data.endDate) > new Date(data.startDate);
}, {
  message: "Ngày kết thúc phải sau ngày bắt đầu",
  path: ["endDate"]
});

type BestSellingProduct = {
  productId: number;
  productName: string;
  productSku: string | null;
  totalSold: number;
  totalRevenue: number;
  averagePrice: number;
  totalOrders: number;
  conversionRate: number;
  stockRemaining: number;
  category: string | null;
};

type GetBestSellingProductsResult =
  | { 
      success: true; 
      products: BestSellingProduct[];
      total: number;
    }
  | { success: false; error: string };

export async function getBestSellingProducts(
  dateRange: DateRange,
  limit: number = 20
): Promise<GetBestSellingProductsResult> {
  try {
    // Validate input
    const validatedData = bestSellingProductsSchema.parse(dateRange);

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
        error: "Chỉ admin mới có thể xem danh sách sản phẩm bán chạy",
      };
    }

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
      .lte("orders.created_at", validatedData.endDate)
      .neq("orders.status", "cancelled");

    if (orderItemsError) {
      return {
        success: false,
        error: "Lỗi khi lấy dữ liệu order items",
      };
    }

    // Lấy thông tin sản phẩm hiện tại
    const { data: productsData, error: productsError } = await supabase
      .from("products")
      .select(`
        id,
        stock_quantity,
        categories (
          name
        )
      `);

    if (productsError) {
      return {
        success: false,
        error: "Lỗi khi lấy thông tin sản phẩm",
      };
    }

    // Tạo map cho thông tin sản phẩm
    const productInfoMap = new Map(
      productsData?.map(product => [
        product.id,
        {
          stockRemaining: product.stock_quantity,
          category: product.categories?.name || null,
        }
      ]) || []
    );

    // Nhóm dữ liệu theo sản phẩm
    const productMap = new Map<number, BestSellingProduct>();

    orderItemsData?.forEach(item => {
      const productId = item.product_id;
      
      if (!productMap.has(productId)) {
        const productInfo = productInfoMap.get(productId);
        
        productMap.set(productId, {
          productId,
          productName: item.product_name,
          productSku: item.product_sku,
          totalSold: 0,
          totalRevenue: 0,
          averagePrice: 0,
          totalOrders: 0,
          conversionRate: 100, // Mặc định 100% vì chỉ tính đơn hàng thành công
          stockRemaining: productInfo?.stockRemaining || 0,
          category: productInfo?.category || null,
        });
      }

      const productData = productMap.get(productId)!;
      productData.totalSold += item.quantity;
      productData.totalRevenue += item.total_price;
      productData.totalOrders += 1;
    });

    // Tính average price
    productMap.forEach(productData => {
      if (productData.totalSold > 0) {
        productData.averagePrice = Math.round(productData.totalRevenue / productData.totalSold);
      }
    });

    // Sắp xếp theo tổng số lượng bán và áp dụng limit
    const bestSellingProducts = Array.from(productMap.values())
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, limit);

    return {
      success: true,
      products: bestSellingProducts,
      total: productMap.size,
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
      error: "Đã xảy ra lỗi không mong muốn khi lấy danh sách sản phẩm bán chạy",
    };
  }
} 