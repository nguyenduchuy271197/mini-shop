"use server";

import { createClient } from "@/lib/supabase/server";
import { Product } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const updateStockSchema = z.object({
  productId: z.number().positive("ID sản phẩm không hợp lệ"),
  quantity: z.number().int().min(0, "Số lượng tồn kho không thể âm"),
  operation: z.enum(["set", "add", "subtract"]).optional().default("set"),
  reason: z.string().min(3, "Lý do phải có ít nhất 3 ký tự").max(500, "Lý do tối đa 500 ký tự").optional(),
});

type UpdateStockData = z.infer<typeof updateStockSchema>;

// Return type
type UpdateStockResult =
  | {
      success: true;
      message: string;
      product: Product;
      previousStock: number;
      newStock: number;
    }
  | { success: false; error: string };

export async function updateProductStock(data: UpdateStockData): Promise<UpdateStockResult> {
  try {
    // 1. Validate input
    const { productId, quantity, operation } = updateStockSchema.parse(data);

    // 2. Create Supabase client
    const supabase = createClient();

    // 3. Check admin authorization
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "Bạn cần đăng nhập để cập nhật tồn kho",
      };
    }

    // Check if user is admin
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || !userRole || userRole.role !== "admin") {
      return {
        success: false,
        error: "Bạn không có quyền cập nhật tồn kho",
      };
    }

    // 4. Get existing product
    const { data: existingProduct, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return {
          success: false,
          error: "Không tìm thấy sản phẩm",
        };
      }
      return {
        success: false,
        error: fetchError.message || "Không thể lấy thông tin sản phẩm",
      };
    }

    if (!existingProduct) {
      return {
        success: false,
        error: "Không tìm thấy sản phẩm",
      };
    }

    // 5. Calculate new stock quantity based on operation
    const previousStock = existingProduct.stock_quantity;
    let newStock: number;

    switch (operation) {
      case "set":
        newStock = quantity;
        break;
      case "add":
        newStock = previousStock + quantity;
        break;
      case "subtract":
        newStock = previousStock - quantity;
        if (newStock < 0) {
          return {
            success: false,
            error: `Không thể trừ ${quantity} từ tồn kho hiện tại (${previousStock}). Kết quả sẽ âm.`,
          };
        }
        break;
      default:
        return {
          success: false,
          error: "Phép tính không hợp lệ",
        };
    }

    // 6. Check for pending orders if reducing stock significantly
    if (newStock < previousStock) {
      const { data: pendingOrders, error: ordersError } = await supabase
        .from("order_items")
        .select(`
          quantity,
          orders!inner (
            id,
            status
          )
        `)
        .eq("product_id", productId)
        .in("orders.status", ["pending", "confirmed", "processing"]);

      if (ordersError) {
        console.error("Error checking pending orders:", ordersError);
      } else if (pendingOrders && pendingOrders.length > 0) {
        const totalPendingQuantity = pendingOrders.reduce((sum, item) => sum + item.quantity, 0);
        
        if (newStock < totalPendingQuantity) {
          return {
            success: false,
            error: `Cảnh báo: Tồn kho mới (${newStock}) nhỏ hơn số lượng đang trong đơn hàng chờ xử lý (${totalPendingQuantity}). Điều này có thể gây ra thiếu hàng.`,
          };
        }
      }
    }

    // 7. Update stock quantity
    const { data: updatedProduct, error: updateError } = await supabase
      .from("products")
      .update({
        stock_quantity: newStock,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId)
      .select()
      .single();

    if (updateError) {
      return {
        success: false,
        error: updateError.message || "Không thể cập nhật tồn kho",
      };
    }

    if (!updatedProduct) {
      return {
        success: false,
        error: "Không thể cập nhật tồn kho",
      };
    }

    // 8. Create stock change message
    let operationText: string;
    let changeText: string;

    switch (operation) {
      case "set":
        operationText = "đặt";
        changeText = `${previousStock} → ${newStock}`;
        break;
      case "add":
        operationText = "tăng";
        changeText = `${previousStock} + ${quantity} = ${newStock}`;
        break;
      case "subtract":
        operationText = "giảm";
        changeText = `${previousStock} - ${quantity} = ${newStock}`;
        break;
      default:
        operationText = "cập nhật";
        changeText = `${previousStock} → ${newStock}`;
    }

    // 9. Check if stock is below threshold
    let warningMessage = "";
    if (newStock <= existingProduct.low_stock_threshold) {
      warningMessage = ` (Cảnh báo: Tồn kho thấp - ngưỡng: ${existingProduct.low_stock_threshold})`;
    }

    return {
      success: true,
      message: `Đã ${operationText} tồn kho sản phẩm "${existingProduct.name}": ${changeText}${warningMessage}`,
      product: updatedProduct,
      previousStock,
      newStock,
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
      error: "Đã xảy ra lỗi không mong muốn khi cập nhật tồn kho",
    };
  }
} 