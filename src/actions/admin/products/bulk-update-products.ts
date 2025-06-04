"use server";

import { createClient } from "@/lib/supabase/server";
import { Product } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const bulkUpdateProductsSchema = z.object({
  productIds: z.array(z.number().positive("ID sản phẩm không hợp lệ")).min(1, "Phải có ít nhất một sản phẩm"),
  updates: z.object({
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    categoryId: z.number().positive("ID danh mục không hợp lệ").optional(),
    price: z.number().positive("Giá phải lớn hơn 0").optional(),
    comparePrice: z.number().positive("Giá so sánh phải lớn hơn 0").optional(),
    stockQuantity: z.number().int().min(0, "Số lượng tồn kho không thể âm").optional(),
    lowStockThreshold: z.number().int().min(0, "Ngưỡng tồn kho thấp không thể âm").optional(),
    brand: z.string().max(100, "Thương hiệu tối đa 100 ký tự").optional(),
    tags: z.array(z.string()).optional(),
  }),
});

type BulkUpdateProductsData = z.infer<typeof bulkUpdateProductsSchema>;

// Return type
type BulkUpdateProductsResult =
  | {
      success: true;
      message: string;
      updatedCount: number;
      products: Product[];
    }
  | { success: false; error: string };

export async function bulkUpdateProducts(data: BulkUpdateProductsData): Promise<BulkUpdateProductsResult> {
  try {
    // 1. Validate input
    const { productIds, updates } = bulkUpdateProductsSchema.parse(data);

    // Check if there are fields to update
    if (Object.keys(updates).length === 0) {
      return {
        success: false,
        error: "Không có thông tin nào để cập nhật",
      };
    }

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
        error: "Bạn cần đăng nhập để cập nhật sản phẩm hàng loạt",
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
        error: "Bạn không có quyền cập nhật sản phẩm hàng loạt",
      };
    }

    // 4. Get existing products
    const { data: existingProducts, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .in("id", productIds);

    if (fetchError) {
      return {
        success: false,
        error: fetchError.message || "Không thể lấy thông tin sản phẩm",
      };
    }

    if (!existingProducts || existingProducts.length === 0) {
      return {
        success: false,
        error: "Không tìm thấy sản phẩm nào",
      };
    }

    if (existingProducts.length !== productIds.length) {
      const foundIds = existingProducts.map(p => p.id);
      const missingIds = productIds.filter(id => !foundIds.includes(id));
      return {
        success: false,
        error: `Không tìm thấy sản phẩm với ID: ${missingIds.join(", ")}`,
      };
    }

    // 5. Validate category exists (if updating category)
    if (updates.categoryId) {
      const { data: category, error: categoryError } = await supabase
        .from("categories")
        .select("id, is_active")
        .eq("id", updates.categoryId)
        .single();

      if (categoryError) {
        if (categoryError.code === "PGRST116") {
          return {
            success: false,
            error: "Không tìm thấy danh mục",
          };
        }
        return {
          success: false,
          error: categoryError.message || "Không thể kiểm tra danh mục",
        };
      }

      if (!category.is_active) {
        return {
          success: false,
          error: "Không thể chuyển sản phẩm vào danh mục đã bị vô hiệu hóa",
        };
      }
    }

    // 6. Validate price logic for each product
    if (updates.price || updates.comparePrice) {
      for (const product of existingProducts) {
        const newPrice = updates.price ?? product.price;
        const newComparePrice = updates.comparePrice ?? product.compare_price;

        if (newComparePrice && newComparePrice <= newPrice) {
          return {
            success: false,
            error: `Giá so sánh phải lớn hơn giá bán cho sản phẩm "${product.name}"`,
          };
        }
      }
    }

    // 7. Check for pending orders if deactivating products
    if (updates.isActive === false) {
      const { data: pendingOrders, error: ordersError } = await supabase
        .from("order_items")
        .select(`
          product_id,
          quantity,
          orders!inner (
            id,
            status
          )
        `)
        .in("product_id", productIds)
        .in("orders.status", ["pending", "confirmed", "processing"]);

      if (ordersError) {
        console.error("Error checking pending orders:", ordersError);
      } else if (pendingOrders && pendingOrders.length > 0) {
        const affectedProducts = Array.from(new Set(pendingOrders.map(order => order.product_id)));
        const productNames = existingProducts
          .filter(p => affectedProducts.includes(p.id))
          .map(p => p.name);

        return {
          success: false,
          error: `Cảnh báo: Có đơn hàng đang chờ xử lý cho các sản phẩm: ${productNames.join(", ")}. Không thể vô hiệu hóa.`,
        };
      }
    }

    // 8. Check for stock quantity reduction warnings
    if (updates.stockQuantity !== undefined) {
      const reducedStockProducts = existingProducts.filter(
        product => updates.stockQuantity! < product.stock_quantity
      );

      if (reducedStockProducts.length > 0) {
        // Check pending orders for products with reduced stock
        const { data: pendingOrders, error: ordersError } = await supabase
          .from("order_items")
          .select(`
            product_id,
            quantity,
            orders!inner (
              id,
              status
            )
          `)
          .in("product_id", reducedStockProducts.map(p => p.id))
          .in("orders.status", ["pending", "confirmed", "processing"]);

        if (!ordersError && pendingOrders && pendingOrders.length > 0) {
          const pendingByProduct = pendingOrders.reduce((acc, order) => {
            acc[order.product_id] = (acc[order.product_id] || 0) + order.quantity;
            return acc;
          }, {} as Record<number, number>);

          const problematicProducts = reducedStockProducts.filter(
            product => (pendingByProduct[product.id] || 0) > updates.stockQuantity!
          );

          if (problematicProducts.length > 0) {
            const productNames = problematicProducts.map(p => p.name);
            return {
              success: false,
              error: `Tồn kho mới nhỏ hơn số lượng đang trong đơn hàng chờ xử lý cho các sản phẩm: ${productNames.join(", ")}`,
            };
          }
        }
      }
    }

    // 9. Prepare update data
    const updateData: Record<string, string | number | boolean | string[] | null> = {
      updated_at: new Date().toISOString(),
    };

    // Map fields to database columns
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
    if (updates.isFeatured !== undefined) updateData.is_featured = updates.isFeatured;
    if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId;
    if (updates.price !== undefined) updateData.price = updates.price;
    if (updates.comparePrice !== undefined) updateData.compare_price = updates.comparePrice;
    if (updates.stockQuantity !== undefined) updateData.stock_quantity = updates.stockQuantity;
    if (updates.lowStockThreshold !== undefined) updateData.low_stock_threshold = updates.lowStockThreshold;
    if (updates.brand !== undefined) updateData.brand = updates.brand || null;
    if (updates.tags !== undefined) updateData.tags = updates.tags;

    // 10. Update products
    const { data: updatedProducts, error: updateError } = await supabase
      .from("products")
      .update(updateData)
      .in("id", productIds)
      .select();

    if (updateError) {
      return {
        success: false,
        error: updateError.message || "Không thể cập nhật sản phẩm",
      };
    }

    if (!updatedProducts || updatedProducts.length === 0) {
      return {
        success: false,
        error: "Không thể cập nhật sản phẩm",
      };
    }

    // 11. Create summary message
    const updateFields = Object.keys(updates).filter(key => updates[key as keyof typeof updates] !== undefined);
    const updateFieldNames = updateFields.map(field => {
      switch (field) {
        case 'isActive': return 'trạng thái kích hoạt';
        case 'isFeatured': return 'sản phẩm nổi bật';
        case 'categoryId': return 'danh mục';
        case 'price': return 'giá bán';
        case 'comparePrice': return 'giá so sánh';
        case 'stockQuantity': return 'tồn kho';
        case 'lowStockThreshold': return 'ngưỡng tồn kho thấp';
        case 'brand': return 'thương hiệu';
        case 'tags': return 'thẻ tag';
        default: return field;
      }
    });

    return {
      success: true,
      message: `Đã cập nhật ${updatedProducts.length} sản phẩm: ${updateFieldNames.join(", ")}`,
      updatedCount: updatedProducts.length,
      products: updatedProducts,
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
      error: "Đã xảy ra lỗi không mong muốn khi cập nhật sản phẩm hàng loạt",
    };
  }
} 