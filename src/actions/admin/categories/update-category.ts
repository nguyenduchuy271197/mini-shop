"use server";

import { createClient } from "@/lib/supabase/server";
import { Category } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const updateCategorySchema = z.object({
  categoryId: z.number().positive("ID danh mục không hợp lệ"),
  name: z.string().min(2, "Tên danh mục phải có ít nhất 2 ký tự").max(100, "Tên danh mục tối đa 100 ký tự").optional(),
  slug: z.string().min(2, "Slug phải có ít nhất 2 ký tự").max(100, "Slug tối đa 100 ký tự").regex(/^[a-z0-9-]+$/, "Slug chỉ được chứa chữ thường, số và dấu gạch ngang").optional(),
  description: z.string().max(1000, "Mô tả tối đa 1000 ký tự").optional(),
  imageUrl: z.string().url("URL hình ảnh không hợp lệ").optional(),
  sortOrder: z.number().int().min(0, "Thứ tự sắp xếp không thể âm").optional(),
  isActive: z.boolean().optional(),
});

type UpdateCategoryData = z.infer<typeof updateCategorySchema>;

// Return type
type UpdateCategoryResult =
  | {
      success: true;
      message: string;
      category: Category;
    }
  | { success: false; error: string };

export async function updateCategory(data: UpdateCategoryData): Promise<UpdateCategoryResult> {
  try {
    // 1. Validate input
    const { categoryId, ...updateFields } = updateCategorySchema.parse(data);

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
        error: "Bạn cần đăng nhập để cập nhật danh mục",
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
        error: "Bạn không có quyền cập nhật danh mục",
      };
    }

    // 4. Get existing category
    const { data: existingCategory, error: fetchError } = await supabase
      .from("categories")
      .select("*")
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

    // 5. Check if slug already exists (if updating slug)
    if (updateFields.slug && updateFields.slug !== existingCategory.slug) {
      const { data: existingSlug, error: slugError } = await supabase
        .from("categories")
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

    // 6. Check if name already exists (if updating name)
    if (updateFields.name && updateFields.name !== existingCategory.name) {
      const { data: existingName, error: nameError } = await supabase
        .from("categories")
        .select("id")
        .eq("name", updateFields.name)
        .single();

      if (nameError && nameError.code !== "PGRST116") {
        return {
          success: false,
          error: nameError.message || "Không thể kiểm tra tên danh mục",
        };
      }

      if (existingName) {
        return {
          success: false,
          error: "Tên danh mục này đã được sử dụng",
        };
      }
    }

    // 7. Check for products before deactivating
    if (updateFields.isActive === false && existingCategory.is_active) {
      // Check for active products in this category
      const { data: activeProducts, error: productsError } = await supabase
        .from("products")
        .select("id, name")
        .eq("category_id", categoryId)
        .eq("is_active", true)
        .limit(5);

      if (productsError) {
        console.error("Error checking products:", productsError);
      } else if (activeProducts && activeProducts.length > 0) {
        const productNames = activeProducts.map(p => p.name).join(", ");
        return {
          success: false,
          error: `Không thể vô hiệu hóa danh mục này vì có ${activeProducts.length} sản phẩm đang hoạt động: ${productNames}`,
        };
      }
    }

    // 8. Prepare update data
    const updateData: Record<string, string | number | boolean | null> = {
      updated_at: new Date().toISOString(),
    };

    // Map fields to database columns
    if (updateFields.name !== undefined) updateData.name = updateFields.name;
    if (updateFields.slug !== undefined) updateData.slug = updateFields.slug;
    if (updateFields.description !== undefined) updateData.description = updateFields.description || null;
    if (updateFields.imageUrl !== undefined) updateData.image_url = updateFields.imageUrl || null;
    if (updateFields.sortOrder !== undefined) updateData.sort_order = updateFields.sortOrder;
    if (updateFields.isActive !== undefined) updateData.is_active = updateFields.isActive;

    // 9. Update category
    const { data: updatedCategory, error: updateError } = await supabase
      .from("categories")
      .update(updateData)
      .eq("id", categoryId)
      .select()
      .single();

    if (updateError) {
      return {
        success: false,
        error: updateError.message || "Không thể cập nhật danh mục",
      };
    }

    if (!updatedCategory) {
      return {
        success: false,
        error: "Không thể cập nhật danh mục",
      };
    }

    return {
      success: true,
      message: `Đã cập nhật danh mục "${updatedCategory.name}" thành công`,
      category: updatedCategory,
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
      error: "Đã xảy ra lỗi không mong muốn khi cập nhật danh mục",
    };
  }
} 