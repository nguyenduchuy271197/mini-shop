"use server";

import { createClient } from "@/lib/supabase/server";
import { Category } from "@/types/custom.types";
import { z } from "zod";

// Validation schemas
const categoryOrderSchema = z.object({
  categoryId: z.number().positive("ID danh mục không hợp lệ"),
  sortOrder: z.number().int().min(0, "Thứ tự sắp xếp phải >= 0"),
});

const reorderCategoriesSchema = z.object({
  categoryOrders: z.array(categoryOrderSchema).min(1, "Cần ít nhất một danh mục để sắp xếp"),
});

type ReorderCategoriesData = z.infer<typeof reorderCategoriesSchema>;

// Return type
type ReorderCategoriesResult =
  | {
      success: true;
      message: string;
      updatedCategories: Category[];
    }
  | { success: false; error: string };

export async function reorderCategories(data: ReorderCategoriesData): Promise<ReorderCategoriesResult> {
  try {
    // 1. Validate input
    const { categoryOrders } = reorderCategoriesSchema.parse(data);

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
        error: "Bạn cần đăng nhập để sắp xếp danh mục",
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
        error: "Bạn không có quyền sắp xếp danh mục",
      };
    }

    // 4. Validate all categories exist
    const categoryIds = categoryOrders.map(order => order.categoryId);
    const { data: existingCategories, error: fetchError } = await supabase
      .from("categories")
      .select("id, name")
      .in("id", categoryIds);

    if (fetchError) {
      return {
        success: false,
        error: fetchError.message || "Không thể lấy thông tin danh mục",
      };
    }

    if (!existingCategories || existingCategories.length !== categoryIds.length) {
      const foundIds = existingCategories?.map(c => c.id) || [];
      const missingIds = categoryIds.filter(id => !foundIds.includes(id));
      return {
        success: false,
        error: `Không tìm thấy danh mục với ID: ${missingIds.join(", ")}`,
      };
    }

    // 5. Check for duplicate sort orders
    const sortOrders = categoryOrders.map(order => order.sortOrder);
    const uniqueSortOrders = new Set(sortOrders);
    
    if (sortOrders.length !== uniqueSortOrders.size) {
      return {
        success: false,
        error: "Thứ tự sắp xếp không được trùng lặp",
      };
    }

    // 6. Update categories
    const updatedCategories: Category[] = [];
    const now = new Date().toISOString();

    for (const order of categoryOrders) {
      const { data: updatedCategory, error: updateError } = await supabase
        .from("categories")
        .update({
          sort_order: order.sortOrder,
          updated_at: now,
        })
        .eq("id", order.categoryId)
        .select()
        .single();

      if (updateError) {
        return {
          success: false,
          error: `Không thể cập nhật danh mục ID ${order.categoryId}: ${updateError.message}`,
        };
      }

      if (updatedCategory) {
        updatedCategories.push(updatedCategory);
      }
    }

    return {
      success: true,
      message: `Đã sắp xếp lại ${updatedCategories.length} danh mục thành công`,
      updatedCategories,
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
      error: "Đã xảy ra lỗi không mong muốn khi sắp xếp danh mục",
    };
  }
} 