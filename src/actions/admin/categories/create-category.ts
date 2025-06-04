"use server";

import { createClient } from "@/lib/supabase/server";
import { Category } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const createCategorySchema = z.object({
  name: z.string().min(2, "Tên danh mục phải có ít nhất 2 ký tự").max(100, "Tên danh mục tối đa 100 ký tự"),
  slug: z.string().min(2, "Slug phải có ít nhất 2 ký tự").max(100, "Slug tối đa 100 ký tự").regex(/^[a-z0-9-]+$/, "Slug chỉ được chứa chữ thường, số và dấu gạch ngang"),
  description: z.string().max(1000, "Mô tả tối đa 1000 ký tự").optional(),
  imageUrl: z.string().url("URL hình ảnh không hợp lệ").optional(),
  parentId: z.number().positive("ID danh mục cha không hợp lệ").optional(),
  sortOrder: z.number().int().min(0, "Thứ tự sắp xếp không thể âm").optional().default(0),
  isActive: z.boolean().optional().default(true),
});

type CreateCategoryData = z.infer<typeof createCategorySchema>;

// Return type
type CreateCategoryResult =
  | {
      success: true;
      message: string;
      category: Category;
    }
  | { success: false; error: string };

export async function createCategory(data: CreateCategoryData): Promise<CreateCategoryResult> {
  try {
    // 1. Validate input
    const validatedData = createCategorySchema.parse(data);

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
        error: "Bạn cần đăng nhập để tạo danh mục",
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
        error: "Bạn không có quyền tạo danh mục",
      };
    }

    // 4. Check if slug already exists
    const { data: existingCategory, error: slugError } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", validatedData.slug)
      .single();

    if (slugError && slugError.code !== "PGRST116") {
      return {
        success: false,
        error: slugError.message || "Không thể kiểm tra slug",
      };
    }

    if (existingCategory) {
      return {
        success: false,
        error: "Slug này đã được sử dụng",
      };
    }

    // 5. Check if name already exists
    const { data: existingName, error: nameError } = await supabase
      .from("categories")
      .select("id")
      .eq("name", validatedData.name)
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

    // 6. Validate parent category exists and is active (if provided)
    if (validatedData.parentId) {
      const { data: parentCategory, error: parentError } = await supabase
        .from("categories")
        .select("id, is_active, name")
        .eq("id", validatedData.parentId)
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
          error: "Không thể tạo danh mục con trong danh mục cha đã bị vô hiệu hóa",
        };
      }
    }

    // 7. Get next sort order if not provided
    let sortOrder = validatedData.sortOrder;
    if (sortOrder === 0) {
      let query = supabase
        .from("categories")
        .select("sort_order")
        .order("sort_order", { ascending: false })
        .limit(1);

      // Handle parent_id filter properly
      if (validatedData.parentId) {
        query = query.eq("parent_id", validatedData.parentId);
      } else {
        query = query.is("parent_id", null);
      }

      const { data: maxSortOrder, error: sortError } = await query.single();

      if (!sortError && maxSortOrder) {
        sortOrder = maxSortOrder.sort_order + 1;
      }
    }

    // 8. Prepare category data
    const now = new Date().toISOString();
    const categoryData = {
      name: validatedData.name,
      slug: validatedData.slug,
      description: validatedData.description || null,
      image_url: validatedData.imageUrl || null,
      parent_id: validatedData.parentId || null,
      sort_order: sortOrder,
      is_active: validatedData.isActive,
      created_at: now,
      updated_at: now,
    };

    // 9. Create category
    const { data: newCategory, error: insertError } = await supabase
      .from("categories")
      .insert(categoryData)
      .select()
      .single();

    if (insertError) {
      return {
        success: false,
        error: insertError.message || "Không thể tạo danh mục",
      };
    }

    if (!newCategory) {
      return {
        success: false,
        error: "Không thể tạo danh mục",
      };
    }

    return {
      success: true,
      message: `Đã tạo danh mục "${validatedData.name}" thành công`,
      category: newCategory,
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
      error: "Đã xảy ra lỗi không mong muốn khi tạo danh mục",
    };
  }
} 