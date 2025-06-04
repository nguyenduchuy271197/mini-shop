"use server";

import { createClient } from "@/lib/supabase/server";
import { Category } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const getCategoryTreeSchema = z.object({
  includeProductCount: z.boolean().optional().default(false),
  includeInactive: z.boolean().optional().default(false),
});

type GetCategoryTreeData = z.infer<typeof getCategoryTreeSchema>;

// Extended category type for tree structure
type CategoryTreeNode = Category & {
  product_count?: number;
  children: CategoryTreeNode[];
  level: number;
  path: string[];
};

// Return type
type GetCategoryTreeResult =
  | { success: true; categories: CategoryTreeNode[] }
  | { success: false; error: string };

export async function getCategoryTree(data?: GetCategoryTreeData): Promise<GetCategoryTreeResult> {
  try {
    // 1. Validate input
    const { includeProductCount, includeInactive } = data 
      ? getCategoryTreeSchema.parse(data) 
      : { includeProductCount: false, includeInactive: false };

    // 2. Create Supabase client
    const supabase = createClient();

    // 3. Get all categories
    let query = supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });

    // Filter by active status unless including inactive
    if (!includeInactive) {
      query = query.eq("is_active", true);
    }

    const { data: categories, error: categoriesError } = await query;

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

    let enrichedCategories: CategoryTreeNode[] = categories.map(cat => ({
      ...cat,
      children: [],
      level: 0,
      path: [],
    }));

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
        enrichedCategories = enrichedCategories.map(category => ({
          ...category,
          product_count: countMap[category.id] || 0,
        }));
      }
    }

    // 5. Build hierarchical tree structure
    const categoryMap = new Map<number, CategoryTreeNode>();
    const rootCategories: CategoryTreeNode[] = [];

    // First pass: create map of all categories
    enrichedCategories.forEach(category => {
      categoryMap.set(category.id, category);
    });

    // Second pass: build hierarchy and calculate levels/paths
    const buildHierarchy = (
      category: CategoryTreeNode, 
      level: number = 0,
      path: string[] = []
    ): CategoryTreeNode => {
      const currentPath = [...path, category.name];
      const updatedCategory: CategoryTreeNode = {
        ...category,
        level,
        path: currentPath,
        children: [] as CategoryTreeNode[],
      };

      // Find and add children
      enrichedCategories
        .filter(cat => cat.parent_id === category.id)
        .forEach(child => {
          const childNode = buildHierarchy(child, level + 1, currentPath);
          updatedCategory.children.push(childNode);
        });

      // Sort children by sort_order
      updatedCategory.children.sort((a, b) => a.sort_order - b.sort_order);

      return updatedCategory;
    };

    // Build tree starting from root categories (parent_id is null)
    enrichedCategories
      .filter(cat => cat.parent_id === null)
      .forEach(rootCat => {
        const treeNode = buildHierarchy(rootCat);
        rootCategories.push(treeNode);
      });

    // Sort root categories by sort_order
    rootCategories.sort((a, b) => a.sort_order - b.sort_order);

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
      error: "Đã xảy ra lỗi không mong muốn khi lấy cây danh mục",
    };
  }
} 