"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schema
const deleteCategorySchema = z.object({
  categoryId: z.number().positive("ID danh mục không hợp lệ"),
  force: z.boolean().optional().default(false), // Force delete even with dependencies
});

type DeleteCategoryData = z.infer<typeof deleteCategorySchema>;

// Return type
type DeleteCategoryResult =
  | {
      success: true;
      message: string;
    }
  | { success: false; error: string };

export async function deleteCategory(data: DeleteCategoryData): Promise<DeleteCategoryResult> {
  try {
    // 1. Validate input
    const { categoryId, force } = deleteCategorySchema.parse(data);

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
        error: "Bạn cần đăng nhập để xóa danh mục",
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
        error: "Bạn không có quyền xóa danh mục",
      };
    }

    // 4. Get existing category
    const { data: existingCategory, error: fetchError } = await supabase
      .from("categories")
      .select("id, name, parent_id")
      .eq("id", categoryId)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return {
          success: false,
          error: "Không tìm thấy danh mục",
        };
      }
      return {
        success: false,
        error: fetchError.message || "Không thể lấy thông tin danh mục",
      };
    }

    if (!existingCategory) {
      return {
        success: false,
        error: "Không tìm thấy danh mục",
      };
    }

    // 5. Check for dependencies before deletion (unless force = true)
    if (!force) {
      // Check for products in this category
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, name")
        .eq("category_id", categoryId)
        .limit(5);

      if (productsError) {
        console.error("Error checking products:", productsError);
      } else if (products && products.length > 0) {
        const productNames = products.map(p => p.name).join(", ");
        return {
          success: false,
          error: `Không thể xóa danh mục này vì có ${products.length} sản phẩm: ${productNames}. Hãy chuyển sản phẩm sang danh mục khác hoặc sử dụng tùy chọn xóa ép buộc.`,
        };
      }

      // Check for subcategories
      const { data: subcategories, error: subcatError } = await supabase
        .from("categories")
        .select("id, name")
        .eq("parent_id", categoryId);

      if (subcatError) {
        console.error("Error checking subcategories:", subcatError);
      } else if (subcategories && subcategories.length > 0) {
        const subcatNames = subcategories.map(c => c.name).join(", ");
        return {
          success: false,
          error: `Không thể xóa danh mục này vì có ${subcategories.length} danh mục con: ${subcatNames}. Hãy xóa hoặc chuyển danh mục con trước hoặc sử dụng tùy chọn xóa ép buộc.`,
        };
      }
    }

    // 6. If force delete, handle dependencies
    if (force) {
      try {
        // Move products to parent category or null
        const { error: updateProductsError } = await supabase
          .from("products")
          .update({
            category_id: existingCategory.parent_id,
            updated_at: new Date().toISOString(),
          })
          .eq("category_id", categoryId);

        if (updateProductsError) {
          console.error("Error updating products:", updateProductsError);
          return {
            success: false,
            error: "Không thể cập nhật sản phẩm trước khi xóa danh mục",
          };
        }

        // Move subcategories to parent category or make them root categories
        const { error: updateSubcategoriesError } = await supabase
          .from("categories")
          .update({
            parent_id: existingCategory.parent_id,
            updated_at: new Date().toISOString(),
          })
          .eq("parent_id", categoryId);

        if (updateSubcategoriesError) {
          console.error("Error updating subcategories:", updateSubcategoriesError);
          return {
            success: false,
            error: "Không thể cập nhật danh mục con trước khi xóa danh mục",
          };
        }
      } catch (cleanupError) {
        console.error("Error during cleanup:", cleanupError);
        return {
          success: false,
          error: "Không thể dọn dẹp dữ liệu liên quan trước khi xóa danh mục",
        };
      }
    }

    // 7. Delete category
    const { error: deleteError } = await supabase
      .from("categories")
      .delete()
      .eq("id", categoryId);

    if (deleteError) {
      // If foreign key constraint error, provide helpful message
      if (deleteError.code === "23503") {
        return {
          success: false,
          error: "Không thể xóa danh mục này vì vẫn còn dữ liệu liên quan. Hãy sử dụng tùy chọn xóa ép buộc hoặc di chuyển sản phẩm/danh mục con trước khi xóa.",
        };
      }
      
      return {
        success: false,
        error: deleteError.message || "Không thể xóa danh mục",
      };
    }

    return {
      success: true,
      message: `Đã xóa danh mục "${existingCategory.name}" thành công`,
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
      error: "Đã xảy ra lỗi không mong muốn khi xóa danh mục",
    };
  }
} 