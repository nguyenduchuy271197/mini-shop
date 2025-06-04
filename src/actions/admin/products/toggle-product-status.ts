"use server";

import { createClient } from "@/lib/supabase/server";
import { Product } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const toggleProductStatusSchema = z.object({
  productId: z.number().positive("ID sản phẩm không hợp lệ"),
  isActive: z.boolean(),
});

type ToggleProductStatusData = z.infer<typeof toggleProductStatusSchema>;

// Return type
type ToggleProductStatusResult =
  | {
      success: true;
      message: string;
      product: Product;
    }
  | { success: false; error: string };

export async function toggleProductStatus(data: ToggleProductStatusData): Promise<ToggleProductStatusResult> {
  try {
    // 1. Validate input
    const { productId, isActive } = toggleProductStatusSchema.parse(data);

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
        error: "Bạn cần đăng nhập để thay đổi trạng thái sản phẩm",
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
        error: "Bạn không có quyền thay đổi trạng thái sản phẩm",
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

    // 5. Check if status is already the desired value
    if (existingProduct.is_active === isActive) {
      const statusText = isActive ? "đã được kích hoạt" : "đã bị vô hiệu hóa";
      return {
        success: false,
        error: `Sản phẩm "${existingProduct.name}" ${statusText} rồi`,
      };
    }

    // 6. If deactivating, check for pending orders
    if (!isActive) {
      const { data: pendingOrders, error: ordersError } = await supabase
        .from("order_items")
        .select(`
          id,
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
        return {
          success: false,
          error: `Cảnh báo: Có ${pendingOrders.length} đơn hàng đang chờ xử lý cho sản phẩm này. Bạn có chắc muốn vô hiệu hóa?`,
        };
      }
    }

    // 7. Update product status
    const { data: updatedProduct, error: updateError } = await supabase
      .from("products")
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId)
      .select()
      .single();

    if (updateError) {
      return {
        success: false,
        error: updateError.message || "Không thể cập nhật trạng thái sản phẩm",
      };
    }

    if (!updatedProduct) {
      return {
        success: false,
        error: "Không thể cập nhật trạng thái sản phẩm",
      };
    }

    const actionText = isActive ? "Đã kích hoạt" : "Đã vô hiệu hóa";

    return {
      success: true,
      message: `${actionText} sản phẩm "${existingProduct.name}" thành công`,
      product: updatedProduct,
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
      error: "Đã xảy ra lỗi không mong muốn khi thay đổi trạng thái sản phẩm",
    };
  }
} 