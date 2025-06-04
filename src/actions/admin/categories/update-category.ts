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
  parentId: z.number().positive("ID danh mục cha không hợp lệ").optional(),
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

    // 7. Validate parent category (if updating parent)
    if (updateFields.parentId !== undefined) {
      if (updateFields.parentId) {
        // Check if new parent exists and is active
        const { data: parentCategory, error: parentError } = await supabase
          .from("categories")
          .select("id, is_active, name")
          .eq("id", updateFields.parentId)
          .single();

        if (parentError) {
          if (parentError.code === "PGRST116") {
            return {
              success: false,
              error: "Không tìm thấy danh mục cha",
            };
          }
          return {
            success: false,
            error: parentError.message || "Không thể kiểm tra danh mục cha",
          };
        }

        if (!parentCategory.is_active) {
          return {
            success: false,
            error: "Không thể chuyển vào danh mục cha đã bị vô hiệu hóa",
          };
        }

        // Check for circular reference (prevent category from being parent of itself or its descendants)
        if (updateFields.parentId === categoryId) {
          return {
            success: false,
            error: "Danh mục không thể là cha của chính nó",
          };
        }

        // Check if current category is an ancestor of the new parent
        let currentParentId: number | null = updateFields.parentId;
        const maxDepth = 10; // Prevent infinite loop
        let depth = 0;

        while (currentParentId && depth < maxDepth) {
          if (currentParentId === categoryId) {
            return {
              success: false,
              error: "Không thể tạo vòng lặp trong cây danh mục",
            };
          }

          const { data: parentCheck, error: parentCheckError }: {
            data: Pick<Category, "parent_id"> | null;
            error: Error | null;
          } = await supabase
            .from("categories")
            .select("parent_id")
            .eq("id", currentParentId)
            .single();

          if (parentCheckError || !parentCheck) break;
          
          currentParentId = parentCheck.parent_id;
          depth++;
        }
      }
    }

    // 8. Check for products and subcategories before deactivating
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

      // Check for active subcategories
      const { data: activeSubcategories, error: subcatError } = await supabase
        .from("categories")
        .select("id, name")
        .eq("parent_id", categoryId)
        .eq("is_active", true);

      if (subcatError) {
        console.error("Error checking subcategories:", subcatError);
      } else if (activeSubcategories && activeSubcategories.length > 0) {
        const subcatNames = activeSubcategories.map(c => c.name).join(", ");
        return {
          success: false,
          error: `Không thể vô hiệu hóa danh mục này vì có ${activeSubcategories.length} danh mục con đang hoạt động: ${subcatNames}`,
        };
      }
    }

    // 9. Prepare update data
    const updateData: Record<string, string | number | boolean | null> = {
      updated_at: new Date().toISOString(),
    };

    // Map fields to database columns
    if (updateFields.name !== undefined) updateData.name = updateFields.name;
    if (updateFields.slug !== undefined) updateData.slug = updateFields.slug;
    if (updateFields.description !== undefined) updateData.description = updateFields.description || null;
    if (updateFields.imageUrl !== undefined) updateData.image_url = updateFields.imageUrl || null;
    if (updateFields.parentId !== undefined) updateData.parent_id = updateFields.parentId || null;
    if (updateFields.sortOrder !== undefined) updateData.sort_order = updateFields.sortOrder;
    if (updateFields.isActive !== undefined) updateData.is_active = updateFields.isActive;

    // 10. Update category
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