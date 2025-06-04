"use server";

import { createClient } from "@/lib/supabase/server";
import { Product } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const updateProductSchema = z.object({
  productId: z.number().positive("ID sản phẩm không hợp lệ"),
  name: z.string().min(3, "Tên sản phẩm phải có ít nhất 3 ký tự").max(255, "Tên sản phẩm tối đa 255 ký tự").optional(),
  slug: z.string().min(3, "Slug phải có ít nhất 3 ký tự").max(255, "Slug tối đa 255 ký tự").regex(/^[a-z0-9-]+$/, "Slug chỉ được chứa chữ thường, số và dấu gạch ngang").optional(),
  description: z.string().optional(),
  shortDescription: z.string().max(500, "Mô tả ngắn tối đa 500 ký tự").optional(),
  sku: z.string().optional(),
  price: z.number().positive("Giá phải lớn hơn 0").optional(),
  comparePrice: z.number().positive("Giá so sánh phải lớn hơn 0").optional(),
  costPrice: z.number().positive("Giá gốc phải lớn hơn 0").optional(),
  stockQuantity: z.number().int().min(0, "Số lượng tồn kho không thể âm").optional(),
  lowStockThreshold: z.number().int().min(0, "Ngưỡng tồn kho thấp không thể âm").optional(),
  categoryId: z.number().positive("ID danh mục không hợp lệ").optional(),
  brand: z.string().max(100, "Thương hiệu tối đa 100 ký tự").optional(),
  weight: z.number().positive("Trọng lượng phải lớn hơn 0").optional(),
  dimensions: z.object({
    length: z.number().positive("Chiều dài phải lớn hơn 0").optional(),
    width: z.number().positive("Chiều rộng phải lớn hơn 0").optional(),
    height: z.number().positive("Chiều cao phải lớn hơn 0").optional(),
    unit: z.enum(["cm", "m", "mm"]).optional().default("cm"),
  }).optional(),
  images: z.array(z.string().url("URL hình ảnh không hợp lệ")).optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  metaTitle: z.string().max(255, "Meta title tối đa 255 ký tự").optional(),
  metaDescription: z.string().max(500, "Meta description tối đa 500 ký tự").optional(),
});

type UpdateProductData = z.infer<typeof updateProductSchema>;

// Return type
type UpdateProductResult =
  | {
      success: true;
      message: string;
      product: Product;
    }
  | { success: false; error: string };

export async function updateProduct(data: UpdateProductData): Promise<UpdateProductResult> {
  try {
    // 1. Validate input
    const { productId, ...updateFields } = updateProductSchema.parse(data);

    // Check if there are fields to update
    if (Object.keys(updateFields).length === 0) {
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
        error: "Bạn cần đăng nhập để cập nhật sản phẩm",
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
        error: "Bạn không có quyền cập nhật sản phẩm",
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

    // 5. Check if slug already exists (if updating slug)
    if (updateFields.slug && updateFields.slug !== existingProduct.slug) {
      const { data: existingSlug, error: slugError } = await supabase
        .from("products")
        .select("id")
        .eq("slug", updateFields.slug)
        .single();

      if (slugError && slugError.code !== "PGRST116") {
        return {
          success: false,
          error: slugError.message || "Không thể kiểm tra slug",
        };
      }

      if (existingSlug) {
        return {
          success: false,
          error: "Slug này đã được sử dụng",
        };
      }
    }

    // 6. Check if SKU already exists (if updating SKU)
    if (updateFields.sku && updateFields.sku !== existingProduct.sku) {
      const { data: existingSku, error: skuError } = await supabase
        .from("products")
        .select("id")
        .eq("sku", updateFields.sku)
        .single();

      if (skuError && skuError.code !== "PGRST116") {
        return {
          success: false,
          error: skuError.message || "Không thể kiểm tra SKU",
        };
      }

      if (existingSku) {
        return {
          success: false,
          error: "SKU này đã được sử dụng",
        };
      }
    }

    // 7. Validate category exists (if updating category)
    if (updateFields.categoryId) {
      const { data: category, error: categoryError } = await supabase
        .from("categories")
        .select("id, is_active")
        .eq("id", updateFields.categoryId)
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

    // 8. Validate price logic
    const newPrice = updateFields.price ?? existingProduct.price;
    const newComparePrice = updateFields.comparePrice ?? existingProduct.compare_price;
    const newCostPrice = updateFields.costPrice ?? existingProduct.cost_price;

    if (newComparePrice && newComparePrice <= newPrice) {
      return {
        success: false,
        error: "Giá so sánh phải lớn hơn giá bán",
      };
    }

    if (newCostPrice && newCostPrice >= newPrice) {
      return {
        success: false,
        error: "Giá gốc phải nhỏ hơn giá bán",
      };
    }

    // 9. Check for pending orders before reducing stock
    if (updateFields.stockQuantity !== undefined && updateFields.stockQuantity < existingProduct.stock_quantity) {
      
      // Check if there are pending orders that might be affected
      const { data: pendingOrders, error: ordersError } = await supabase
        .from("order_items")
        .select(`
          quantity,
          orders!inner (
            status
          )
        `)
        .eq("product_id", productId)
        .in("orders.status", ["pending", "confirmed", "processing"]);

      if (ordersError) {
        console.error("Error checking pending orders:", ordersError);
      } else if (pendingOrders && pendingOrders.length > 0) {
        const totalPendingQuantity = pendingOrders.reduce((sum, item) => sum + item.quantity, 0);
        
        if (updateFields.stockQuantity < totalPendingQuantity) {
          return {
            success: false,
            error: `Không thể giảm tồn kho xuống ${updateFields.stockQuantity}. Có ${totalPendingQuantity} sản phẩm đang trong đơn hàng chưa hoàn thành.`,
          };
        }
      }
    }

    // 10. Prepare update data
    const updateData: Record<string, string | number | boolean | string[] | null | object> = {
      updated_at: new Date().toISOString(),
    };

    // Map fields to database columns
    if (updateFields.name !== undefined) updateData.name = updateFields.name;
    if (updateFields.slug !== undefined) updateData.slug = updateFields.slug;
    if (updateFields.description !== undefined) updateData.description = updateFields.description || null;
    if (updateFields.shortDescription !== undefined) updateData.short_description = updateFields.shortDescription || null;
    if (updateFields.sku !== undefined) updateData.sku = updateFields.sku || null;
    if (updateFields.price !== undefined) updateData.price = updateFields.price;
    if (updateFields.comparePrice !== undefined) updateData.compare_price = updateFields.comparePrice || null;
    if (updateFields.costPrice !== undefined) updateData.cost_price = updateFields.costPrice || null;
    if (updateFields.stockQuantity !== undefined) updateData.stock_quantity = updateFields.stockQuantity;
    if (updateFields.lowStockThreshold !== undefined) updateData.low_stock_threshold = updateFields.lowStockThreshold;
    if (updateFields.categoryId !== undefined) updateData.category_id = updateFields.categoryId || null;
    if (updateFields.brand !== undefined) updateData.brand = updateFields.brand || null;
    if (updateFields.weight !== undefined) updateData.weight = updateFields.weight || null;
    if (updateFields.dimensions !== undefined) updateData.dimensions = updateFields.dimensions || null;
    if (updateFields.images !== undefined) updateData.images = updateFields.images;
    if (updateFields.tags !== undefined) updateData.tags = updateFields.tags;
    if (updateFields.isActive !== undefined) updateData.is_active = updateFields.isActive;
    if (updateFields.isFeatured !== undefined) updateData.is_featured = updateFields.isFeatured;
    if (updateFields.metaTitle !== undefined) updateData.meta_title = updateFields.metaTitle || null;
    if (updateFields.metaDescription !== undefined) updateData.meta_description = updateFields.metaDescription || null;

    // 11. Update product
    const { data: updatedProduct, error: updateError } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", productId)
      .select()
      .single();

    if (updateError) {
      return {
        success: false,
        error: updateError.message || "Không thể cập nhật sản phẩm",
      };
    }

    if (!updatedProduct) {
      return {
        success: false,
        error: "Không thể cập nhật sản phẩm",
      };
    }

    return {
      success: true,
      message: `Đã cập nhật sản phẩm "${updatedProduct.name}" thành công`,
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
      error: "Đã xảy ra lỗi không mong muốn khi cập nhật sản phẩm",
    };
  }
} 