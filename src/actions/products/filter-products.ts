"use server";

import { createClient } from "@/lib/supabase/server";
import { Product, Category } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const productFiltersSchema = z.object({
  categoryId: z.number().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  brand: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional(),
  inStock: z.boolean().optional(),
  priceRange: z.enum(["under-100000", "100000-500000", "500000-1000000", "over-1000000"]).optional(),
});

type ProductFilters = z.infer<typeof productFiltersSchema>;

// Extended product type with category info
type ProductWithCategory = Product & {
  category?: Pick<Category, "id" | "name" | "slug"> | null;
};

// Return type
type FilterProductsResult =
  | { success: true; products: ProductWithCategory[]; total: number }
  | { success: false; error: string };

export async function filterProducts(filters: ProductFilters): Promise<FilterProductsResult> {
  try {
    // 1. Validate input
    const validatedFilters = productFiltersSchema.parse(filters);

    // 2. Create Supabase client
    const supabase = createClient();

    // 3. Build query
    let query = supabase
      .from("products")
      .select(`
        *,
        category:categories (
          id,
          name,
          slug
        )
      `);

    // Apply filters
    if (validatedFilters.isActive !== undefined) {
      query = query.eq("is_active", validatedFilters.isActive);
    }

    if (validatedFilters.categoryId) {
      query = query.eq("category_id", validatedFilters.categoryId);
    }

    if (validatedFilters.minPrice !== undefined) {
      query = query.gte("price", validatedFilters.minPrice);
    }

    if (validatedFilters.maxPrice !== undefined) {
      query = query.lte("price", validatedFilters.maxPrice);
    }

    // Handle predefined price ranges
    if (validatedFilters.priceRange) {
      switch (validatedFilters.priceRange) {
        case "under-100000":
          query = query.lt("price", 100000);
          break;
        case "100000-500000":
          query = query.gte("price", 100000).lte("price", 500000);
          break;
        case "500000-1000000":
          query = query.gte("price", 500000).lte("price", 1000000);
          break;
        case "over-1000000":
          query = query.gt("price", 1000000);
          break;
      }
    }

    if (validatedFilters.brand) {
      query = query.ilike("brand", `%${validatedFilters.brand}%`);
    }

    if (validatedFilters.tags && validatedFilters.tags.length > 0) {
      query = query.overlaps("tags", validatedFilters.tags);
    }

    if (validatedFilters.isFeatured !== undefined) {
      query = query.eq("is_featured", validatedFilters.isFeatured);
    }

    if (validatedFilters.inStock) {
      query = query.gt("stock_quantity", 0);
    }

    // Apply default sorting by name
    query = query.order("name", { ascending: true });

    // Get count for total
    const { count, error: countError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .match(Object.fromEntries(
        Object.entries({
          is_active: validatedFilters.isActive,
          category_id: validatedFilters.categoryId,
          is_featured: validatedFilters.isFeatured,
        }).filter(([, value]) => value !== undefined)
      ));

    if (countError) {
      return {
        success: false,
        error: "Không thể đếm số lượng sản phẩm",
      };
    }

    // Execute query
    const { data: products, error: productsError } = await query;

    if (productsError) {
      return {
        success: false,
        error: productsError.message || "Không thể lọc sản phẩm",
      };
    }

    if (!products) {
      return {
        success: false,
        error: "Không tìm thấy sản phẩm",
      };
    }

    return {
      success: true,
      products,
      total: count || 0,
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
      error: "Đã xảy ra lỗi không mong muốn khi lọc sản phẩm",
    };
  }
} 