"use server";

import { createClient } from "@/lib/supabase/server";

type InventoryItem = {
  id: number;
  name: string;
  sku: string | null;
  currentStock: number;
  lowStockThreshold: number;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";
  stockValue: number;
  price: number;
  category: string | null;
  lastRestocked: string | null;
};

type InventoryReportSummary = {
  totalProducts: number;
  totalStockValue: number;
  inStockItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  averageStockValue: number;
};

type GetInventoryReportResult =
  | { 
      success: true; 
      inventory: InventoryItem[];
      summary: InventoryReportSummary;
    }
  | { success: false; error: string };

export async function getInventoryReport(): Promise<GetInventoryReportResult> {
  try {
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
        error: "Chỉ admin mới có thể xem báo cáo tồn kho",
      };
    }

    // Lấy thông tin sản phẩm với category
    const { data: productsData, error: productsError } = await supabase
      .from("products")
      .select(`
        id,
        name,
        sku,
        price,
        stock_quantity,
        low_stock_threshold,
        updated_at,
        categories (
          name
        )
      `)
      .order("name", { ascending: true });

    if (productsError) {
      return {
        success: false,
        error: "Lỗi khi lấy dữ liệu sản phẩm",
      };
    }

    // Xử lý dữ liệu inventory
    const inventory: InventoryItem[] = (productsData || []).map(product => {
      const currentStock = product.stock_quantity;
      const lowStockThreshold = product.low_stock_threshold;
      
      let stockStatus: "in_stock" | "low_stock" | "out_of_stock";
      if (currentStock === 0) {
        stockStatus = "out_of_stock";
      } else if (currentStock <= lowStockThreshold) {
        stockStatus = "low_stock";
      } else {
        stockStatus = "in_stock";
      }

      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        currentStock,
        lowStockThreshold,
        stockStatus,
        stockValue: product.price * currentStock,
        price: product.price,
        category: product.categories?.name || null,
        lastRestocked: product.updated_at,
      };
    });

    // Tính summary
    const summary: InventoryReportSummary = {
      totalProducts: inventory.length,
      totalStockValue: inventory.reduce((sum, item) => sum + item.stockValue, 0),
      inStockItems: inventory.filter(item => item.stockStatus === "in_stock").length,
      lowStockItems: inventory.filter(item => item.stockStatus === "low_stock").length,
      outOfStockItems: inventory.filter(item => item.stockStatus === "out_of_stock").length,
      averageStockValue: 0,
    };

    if (summary.totalProducts > 0) {
      summary.averageStockValue = Math.round(summary.totalStockValue / summary.totalProducts);
    }

    return {
      success: true,
      inventory,
      summary,
    };
  } catch {
    return {
      success: false,
      error: "Đã xảy ra lỗi không mong muốn khi tạo báo cáo tồn kho",
    };
  }
} 