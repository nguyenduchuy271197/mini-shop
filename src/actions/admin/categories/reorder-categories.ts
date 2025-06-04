"use server";

import { createClient } from "@/lib/supabase/server";
import { Category } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const reorderCategoriesSchema = z.object({
  categoryOrders: z.array(
    z.object({
      categoryId: z.number().positive("ID danh mục không hợp lệ"),
      sortOrder: z.number().int().min(0, "Thứ tự sắp xếp không thể âm"),
      parentId: z.number().positive("ID danh mục cha không hợp lệ").optional(),
    })
  ).min(1, "Phải có ít nhất một danh mục để sắp xếp"),
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
      .select("id, name, parent_id")
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

    // 5. Validate parent categories (if any parent changes)
    const parentIds = categoryOrders
      .filter(order => order.parentId !== undefined)
      .map(order => order.parentId!);

    if (parentIds.length > 0) {
      const { data: parentCategories, error: parentError } = await supabase
        .from("categories")
        .select("id, is_active")
        .in("id", parentIds);

      if (parentError) {
        return {
          success: false,
          error: parentError.message || "Không thể kiểm tra danh mục cha",
        };
      }

      const foundParentIds = parentCategories?.map(p => p.id) || [];
      const missingParentIds = parentIds.filter(id => !foundParentIds.includes(id));
      
      if (missingParentIds.length > 0) {
        return {
          success: false,
          error: `Không tìm thấy danh mục cha với ID: ${missingParentIds.join(", ")}`,
        };
      }

      // Check if all parent categories are active
      const inactiveParents = parentCategories?.filter(p => !p.is_active) || [];
      if (inactiveParents.length > 0) {
        const inactiveParentIds = inactiveParents.map(p => p.id);
        return {
          success: false,
          error: `Danh mục cha đã bị vô hiệu hóa: ${inactiveParentIds.join(", ")}`,
        };
      }
    }

    // 6. Check for circular references if parent changes
    for (const order of categoryOrders) {
      if (order.parentId !== undefined) {
        const existingCategory = existingCategories.find(c => c.id === order.categoryId);
        
        // Skip if parent is not changing
        if (existingCategory && existingCategory.parent_id === order.parentId) {
          continue;
        }

        // Check for circular reference
        if (order.parentId === order.categoryId) {
          return {
            success: false,
            error: "Danh mục không thể là cha của chính nó",
          };
        }

        // For now, we'll do a simplified circular reference check
        // In a production system, you might want to implement a more comprehensive check
        // by fetching the entire category tree and validating the hierarchy
      }
    }

    // 7. Check for duplicate sort orders within the same parent level
    const sortOrdersByParent = new Map<number | null, Set<number>>();
    
    for (const order of categoryOrders) {
      const parentId = order.parentId || null;
      
      if (!sortOrdersByParent.has(parentId)) {
        sortOrdersByParent.set(parentId, new Set());
      }
      
      const sortOrders = sortOrdersByParent.get(parentId)!;
      
      if (sortOrders.has(order.sortOrder)) {
        return {
          success: false,
          error: `Thứ tự sắp xếp ${order.sortOrder} bị trùng lặp trong cùng cấp danh mục`,
        };
      }
      
      sortOrders.add(order.sortOrder);
    }

    // 8. Update categories
    const updatedCategories: Category[] = [];
    const now = new Date().toISOString();

    for (const order of categoryOrders) {
      const updateData: Record<string, string | number | null> = {
        sort_order: order.sortOrder,
        updated_at: now,
      };

      // Only update parent_id if it's explicitly provided
      if (order.parentId !== undefined) {
        updateData.parent_id = order.parentId;
      }

      const { data: updatedCategory, error: updateError } = await supabase
        .from("categories")
        .update(updateData)
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