"use server";

import { createClient } from "@/lib/supabase/server";
import { Category } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const getCategoryBySlugSchema = z.object({
  slug: z.string().min(1, "Slug danh mục không được để trống"),
});

type GetCategoryBySlugData = z.infer<typeof getCategoryBySlugSchema>;

// Extended category type with product count and parent info
type CategoryWithDetails = Category & {
  product_count?: number;
  parent?: Pick<Category, "id" | "name" | "slug"> | null;
  children?: Pick<Category, "id" | "name" | "slug">[];
};

// Return type
type GetCategoryBySlugResult =
  | { success: true; category: CategoryWithDetails }
  | { success: false; error: string };

export async function getCategoryBySlug(data: GetCategoryBySlugData): Promise<GetCategoryBySlugResult> {
  try {
    // 1. Validate input
    const { slug } = getCategoryBySlugSchema.parse(data);

    // 2. Create Supabase client
    const supabase = createClient();

    // 3. Get category by slug with parent information
    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select(`
        *,
        parent:categories!parent_id (
          id,
          name,
          slug
        )
      `)
      .eq("slug", slug)
      .eq("is_active", true)
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
        error: categoryError.message || "Không thể lấy thông tin danh mục",
      };
    }

    if (!category) {
      return {
        success: false,
        error: "Không tìm thấy danh mục",
      };
    }

    // 4. Get product count for this category
    const { count: productCount, error: countError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("category_id", category.id)
      .eq("is_active", true);

    if (countError) {
      console.error("Error counting products:", countError);
    }

    // 5. Get child categories
    const { data: children, error: childrenError } = await supabase
      .from("categories")
      .select("id, name, slug")
      .eq("parent_id", category.id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (childrenError) {
      console.error("Error fetching child categories:", childrenError);
    }

    // 6. Combine all data
    const categoryWithDetails: CategoryWithDetails = {
      ...category,
      product_count: productCount || 0,
      children: children || [],
    };

    return {
      success: true,
      category: categoryWithDetails,
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
      error: "Đã xảy ra lỗi không mong muốn khi lấy thông tin danh mục",
    };
  }
} 