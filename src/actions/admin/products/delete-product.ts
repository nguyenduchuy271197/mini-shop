"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schema
const deleteProductSchema = z.object({
  productId: z.number().positive("ID sản phẩm không hợp lệ"),
  force: z.boolean().optional().default(false), // Force delete even with dependencies
});

type DeleteProductData = z.infer<typeof deleteProductSchema>;

// Return type
type DeleteProductResult =
  | {
      success: true;
      message: string;
    }
  | { success: false; error: string };

export async function deleteProduct(data: DeleteProductData): Promise<DeleteProductResult> {
  try {
    // 1. Validate input
    const { productId, force } = deleteProductSchema.parse(data);

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
        error: "Bạn cần đăng nhập để xóa sản phẩm",
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
        error: "Bạn không có quyền xóa sản phẩm",
      };
    }

    // 4. Get existing product
    const { data: existingProduct, error: fetchError } = await supabase
      .from("products")
      .select("id, name, is_active")
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

    // 5. Check for dependencies before deletion (unless force = true)
    if (!force) {
      // Check for pending/active orders
      const { data: activeOrders, error: ordersError } = await supabase
        .from("order_items")
        .select(`
          id,
          orders!inner (
            id,
            status
          )
        `)
        .eq("product_id", productId)
        .in("orders.status", ["pending", "confirmed", "processing", "shipped"]);

      if (ordersError) {
        console.error("Error checking active orders:", ordersError);
      } else if (activeOrders && activeOrders.length > 0) {
        return {
          success: false,
          error: `Không thể xóa sản phẩm này vì có ${activeOrders.length} đơn hàng chưa hoàn thành. Bạn có thể vô hiệu hóa sản phẩm thay vì xóa.`,
        };
      }

      // Check for cart items
      const { data: cartItems, error: cartError } = await supabase
        .from("cart_items")
        .select("id")
        .eq("product_id", productId);

      if (cartError) {
        console.error("Error checking cart items:", cartError);
      } else if (cartItems && cartItems.length > 0) {
        return {
          success: false,
          error: `Không thể xóa sản phẩm này vì có ${cartItems.length} người dùng đang có sản phẩm trong giỏ hàng.`,
        };
      }

      // Check for wishlists
      const { data: wishlistItems, error: wishlistError } = await supabase
        .from("wishlists")
        .select("id")
        .eq("product_id", productId);

      if (wishlistError) {
        console.error("Error checking wishlist items:", wishlistError);
      } else if (wishlistItems && wishlistItems.length > 0) {
        return {
          success: false,
          error: `Không thể xóa sản phẩm này vì có ${wishlistItems.length} người dùng đang có sản phẩm trong danh sách yêu thích.`,
        };
      }

      // Check for reviews
      const { data: reviews, error: reviewsError } = await supabase
        .from("reviews")
        .select("id")
        .eq("product_id", productId);

      if (reviewsError) {
        console.error("Error checking reviews:", reviewsError);
      } else if (reviews && reviews.length > 0) {
        return {
          success: false,
          error: `Không thể xóa sản phẩm này vì có ${reviews.length} đánh giá. Hãy xóa tất cả đánh giá trước hoặc sử dụng tùy chọn xóa ép buộc.`,
        };
      }
    }

    // 6. If force delete, clean up dependencies first
    if (force) {
      try {
        // Remove from carts
        await supabase
          .from("cart_items")
          .delete()
          .eq("product_id", productId);

        // Remove from wishlists
        await supabase
          .from("wishlists")
          .delete()
          .eq("product_id", productId);

        // Note: We don't delete reviews or orders as they are important for data integrity
        // Reviews and completed orders should be preserved for historical data
      } catch (cleanupError) {
        console.error("Error during cleanup:", cleanupError);
        return {
          success: false,
          error: "Không thể dọn dẹp dữ liệu liên quan trước khi xóa sản phẩm",
        };
      }
    }

    // 7. Delete product
    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (deleteError) {
      // If foreign key constraint error, provide helpful message
      if (deleteError.code === "23503") {
        return {
          success: false,
          error: "Không thể xóa sản phẩm này vì vẫn còn dữ liệu liên quan. Hãy sử dụng tùy chọn xóa ép buộc hoặc vô hiệu hóa sản phẩm thay vì xóa.",
        };
      }
      
      return {
        success: false,
        error: deleteError.message || "Không thể xóa sản phẩm",
      };
    }

    return {
      success: true,
      message: `Đã xóa sản phẩm "${existingProduct.name}" thành công`,
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
      error: "Đã xảy ra lỗi không mong muốn khi xóa sản phẩm",
    };
  }
} 