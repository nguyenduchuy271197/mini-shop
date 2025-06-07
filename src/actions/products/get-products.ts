"use server";

import { createClient } from "@/lib/supabase/server";
import { Product, Category } from "@/types/custom.types";
import { z } from "zod";

// Validation schemas
const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

const productFiltersSchema = z.object({
  categoryId: z.number().optional(),
  categoryIds: z.array(z.number()).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  brand: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional(),
  inStock: z.boolean().optional(),
});

const sortOptionsSchema = z.object({
  field: z.enum(["name", "price", "created_at", "stock_quantity"]).default("created_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

type PaginationParams = z.infer<typeof paginationSchema>;
type ProductFilters = z.infer<typeof productFiltersSchema>;
type ProductSortOptions = z.infer<typeof sortOptionsSchema>;

// Extended product type with category info
type ProductWithCategory = Product & {
  category?: Pick<Category, "id" | "name" | "slug"> | null;
};

// Return type
type GetProductsResult =
  | {
      success: true;
      products: ProductWithCategory[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }
  | { success: false; error: string };

export async function getProducts(
  pagination: PaginationParams,
  filters?: ProductFilters,
  sortBy?: ProductSortOptions
): Promise<GetProductsResult> {
  try {
    // 1. Validate input
    const validatedPagination = paginationSchema.parse(pagination);
    const validatedFilters = filters ? productFiltersSchema.parse(filters) : {
      isActive: true,
    } as ProductFilters;
    const validatedSort = sortBy ? sortOptionsSchema.parse(sortBy) : { field: "created_at", order: "desc" } as const;

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

    // Handle category filtering - use categoryIds if available, otherwise categoryId
    if (validatedFilters.categoryIds && validatedFilters.categoryIds.length > 0) {
      query = query.in("category_id", validatedFilters.categoryIds);
    } else if (validatedFilters.categoryId) {
      query = query.eq("category_id", validatedFilters.categoryId);
    }

    if (validatedFilters.minPrice !== undefined) {
      query = query.gte("price", validatedFilters.minPrice);
    }

    if (validatedFilters.maxPrice !== undefined) {
      query = query.lte("price", validatedFilters.maxPrice);
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

    // Apply sorting
    query = query.order(validatedSort.field, { ascending: validatedSort.order === "asc" });

    // Get total count for pagination
    let countQuery = supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    // Apply the same filters to count query
    if (validatedFilters.isActive !== undefined) {
      countQuery = countQuery.eq("is_active", validatedFilters.isActive);
    }

    if (validatedFilters.categoryIds && validatedFilters.categoryIds.length > 0) {
      countQuery = countQuery.in("category_id", validatedFilters.categoryIds);
    } else if (validatedFilters.categoryId) {
      countQuery = countQuery.eq("category_id", validatedFilters.categoryId);
    }

    if (validatedFilters.minPrice !== undefined) {
      countQuery = countQuery.gte("price", validatedFilters.minPrice);
    }

    if (validatedFilters.maxPrice !== undefined) {
      countQuery = countQuery.lte("price", validatedFilters.maxPrice);
    }

    if (validatedFilters.brand) {
      countQuery = countQuery.ilike("brand", `%${validatedFilters.brand}%`);
    }

    if (validatedFilters.tags && validatedFilters.tags.length > 0) {
      countQuery = countQuery.overlaps("tags", validatedFilters.tags);
    }

    if (validatedFilters.isFeatured !== undefined) {
      countQuery = countQuery.eq("is_featured", validatedFilters.isFeatured);
    }

    if (validatedFilters.inStock) {
      countQuery = countQuery.gt("stock_quantity", 0);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      return {
        success: false,
        error: "Không thể đếm số lượng sản phẩm",
      };
    }

    // Apply pagination
    const offset = (validatedPagination.page - 1) * validatedPagination.limit;
    query = query.range(offset, offset + validatedPagination.limit - 1);

    // Execute query
    const { data: products, error: productsError } = await query;

    if (productsError) {
      return {
        success: false,
        error: productsError.message || "Không thể lấy danh sách sản phẩm",
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
    const totalPages = Math.ceil(total / validatedPagination.limit);

    return {
      success: true,
      products,
      pagination: {
        page: validatedPagination.page,
        limit: validatedPagination.limit,
        total,
        totalPages,
      },
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
      error: "Đã xảy ra lỗi không mong muốn khi lấy danh sách sản phẩm",
    };
  }
} 