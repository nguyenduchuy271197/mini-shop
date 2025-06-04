"use server";

import { createClient } from "@/lib/supabase/server";
import { Category } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const getCategoriesSchema = z.object({
  includeProductCount: z.boolean().optional().default(false),
});

type GetCategoriesData = z.infer<typeof getCategoriesSchema>;

// Extended category type with product count
type CategoryWithProductCount = Category & {
  product_count?: number;
  children?: CategoryWithProductCount[];
};

// Return type
type GetCategoriesResult =
  | { success: true; categories: CategoryWithProductCount[] }
  | { success: false; error: string };

export async function getCategories(data?: GetCategoriesData): Promise<GetCategoriesResult> {
  try {
    // 1. Validate input
    const { includeProductCount } = data ? getCategoriesSchema.parse(data) : { includeProductCount: false };

    // 2. Create Supabase client
    const supabase = createClient();

    // 3. Get all active categories
    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (categoriesError) {
      return {
        success: false,
        error: categoriesError.message || "Không thể lấy danh sách danh mục",
      };
    }

    if (!categories) {
      return {
        success: false,
        error: "Không tìm thấy danh mục",
      };
    }

    let enrichedCategories: CategoryWithProductCount[] = categories;

    // 4. Get product count for each category if requested
    if (includeProductCount) {
      const categoryIds = categories.map(cat => cat.id);
      
      const { data: productCounts, error: countError } = await supabase
        .from("products")
        .select("category_id")
        .in("category_id", categoryIds)
        .eq("is_active", true);

      if (countError) {
        console.error("Error counting products:", countError);
      } else {
        // Count products per category
        const countMap = productCounts?.reduce((acc, item) => {
          if (item.category_id) {
            acc[item.category_id] = (acc[item.category_id] || 0) + 1;
          }
          return acc;
        }, {} as Record<number, number>) || {};

        // Add product count to categories
        enrichedCategories = categories.map(category => ({
          ...category,
          product_count: countMap[category.id] || 0,
        }));
      }
    }

    // 5. Build hierarchical structure
    const categoryMap = new Map<number, CategoryWithProductCount>();
    const rootCategories: CategoryWithProductCount[] = [];

    // First pass: create map of all categories
    enrichedCategories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    // Second pass: build hierarchy
    enrichedCategories.forEach(category => {
      const categoryWithChildren = categoryMap.get(category.id)!;
      
      if (category.parent_id) {
        const parent = categoryMap.get(category.parent_id);
        if (parent) {
          parent.children!.push(categoryWithChildren);
        } else {
          // Parent not found or not active, treat as root
          rootCategories.push(categoryWithChildren);
        }
      } else {
        rootCategories.push(categoryWithChildren);
      }
    });

    return {
      success: true,
      categories: rootCategories,
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
      error: "Đã xảy ra lỗi không mong muốn khi lấy danh sách danh mục",
    };
  }
} 