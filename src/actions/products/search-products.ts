"use server";

import { createClient } from "@/lib/supabase/server";
import { Product, Category } from "@/types/custom.types";
import { z } from "zod";

// Validation schemas
const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

const searchFiltersSchema = z.object({
  categoryId: z.number().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  brand: z.string().optional(),
  tags: z.array(z.string()).optional(),
  inStock: z.boolean().optional(),
});

const searchProductsSchema = z.object({
  query: z.string().min(1, "Từ khóa tìm kiếm không được để trống"),
  filters: searchFiltersSchema.optional(),
  pagination: paginationSchema.optional(),
});

type SearchProductsData = z.infer<typeof searchProductsSchema>;

// Extended product type with category info
type ProductWithCategory = Product & {
  category?: Pick<Category, "id" | "name" | "slug"> | null;
};

// Return type
type SearchProductsResult =
  | {
      success: true;
      products: ProductWithCategory[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
      searchQuery: string;
    }
  | { success: false; error: string };

export async function searchProducts(data: SearchProductsData): Promise<SearchProductsResult> {
  try {
    // 1. Validate input
    const validatedData = searchProductsSchema.parse(data);
    const { query, filters = {}, pagination = { page: 1, limit: 20 } } = validatedData;

    // 2. Create Supabase client
    const supabase = createClient();

    // 3. Build search query using text search
    let searchQuery = supabase
      .from("products")
      .select(`
        *,
        category:categories (
          id,
          name,
          slug
        )
      `)
      .eq("is_active", true);

    // Text search on name and description
    searchQuery = searchQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%,brand.ilike.%${query}%`);

    // Apply additional filters
    if (filters.categoryId) {
      searchQuery = searchQuery.eq("category_id", filters.categoryId);
    }

    if (filters.minPrice !== undefined) {
      searchQuery = searchQuery.gte("price", filters.minPrice);
    }

    if (filters.maxPrice !== undefined) {
      searchQuery = searchQuery.lte("price", filters.maxPrice);
    }

    if (filters.brand) {
      searchQuery = searchQuery.ilike("brand", `%${filters.brand}%`);
    }

    if (filters.tags && filters.tags.length > 0) {
      searchQuery = searchQuery.overlaps("tags", filters.tags);
    }

    if (filters.inStock) {
      searchQuery = searchQuery.gt("stock_quantity", 0);
    }

    // Apply sorting by relevance (name match first, then description)
    searchQuery = searchQuery.order("name", { ascending: true });

    // Get total count for pagination
    const countQuery = supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,brand.ilike.%${query}%`);

    // Apply same filters to count query
    if (filters.categoryId) {
      countQuery.eq("category_id", filters.categoryId);
    }
    if (filters.minPrice !== undefined) {
      countQuery.gte("price", filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      countQuery.lte("price", filters.maxPrice);
    }
    if (filters.brand) {
      countQuery.ilike("brand", `%${filters.brand}%`);
    }
    if (filters.tags && filters.tags.length > 0) {
      countQuery.overlaps("tags", filters.tags);
    }
    if (filters.inStock) {
      countQuery.gt("stock_quantity", 0);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      return {
        success: false,
        error: "Không thể đếm số lượng sản phẩm",
      };
    }

    // Apply pagination
    const offset = (pagination.page - 1) * pagination.limit;
    searchQuery = searchQuery.range(offset, offset + pagination.limit - 1);

    // Execute search
    const { data: products, error: searchError } = await searchQuery;

    if (searchError) {
      return {
        success: false,
        error: searchError.message || "Không thể tìm kiếm sản phẩm",
      };
    }

    if (!products) {
      return {
        success: false,
        error: "Không tìm thấy sản phẩm",
      };
    }

    // Calculate pagination info
    const total = count || 0;
    const totalPages = Math.ceil(total / pagination.limit);

    return {
      success: true,
      products,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages,
      },
      searchQuery: query,
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
      error: "Đã xảy ra lỗi không mong muốn khi tìm kiếm sản phẩm",
    };
  }
} 