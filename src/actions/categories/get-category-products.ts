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
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  brand: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  inStock: z.boolean().optional(),
  sortBy: z.enum(["name", "price", "created_at"]).optional().default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

const getCategoryProductsSchema = z.object({
  categoryId: z.number().positive("ID danh mục không hợp lệ"),
  pagination: paginationSchema.optional(),
  filters: productFiltersSchema.optional(),
});

type GetCategoryProductsData = z.infer<typeof getCategoryProductsSchema>;
type ProductFilters = z.infer<typeof productFiltersSchema>;

// Extended product type with category info
type ProductWithCategory = Product & {
  category?: Pick<Category, "id" | "name" | "slug"> | null;
};

// Return type
type GetCategoryProductsResult =
  | {
      success: true;
      products: ProductWithCategory[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
      category: Pick<Category, "id" | "name" | "slug" | "description"> | null;
    }
  | { success: false; error: string };

export async function getCategoryProducts(data: GetCategoryProductsData): Promise<GetCategoryProductsResult> {
  try {
    // 1. Validate input
    const validatedData = getCategoryProductsSchema.parse(data);
    const { categoryId } = validatedData;
    const pagination = validatedData.pagination || { page: 1, limit: 20 };
    const filters: ProductFilters = validatedData.filters || {
      sortBy: "created_at",
      sortOrder: "desc",
    };

    // 2. Create Supabase client
    const supabase = createClient();

    // 3. First, get and validate category
    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id, name, slug, description")
      .eq("id", categoryId)
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

    // 4. Build products query
    let query = supabase
      .from("products")
      .select(`
        *,
        category:categories (
          id,
          name,
          slug
        )
      `)
      .eq("category_id", categoryId)
      .eq("is_active", true);

    // Apply filters
    if (filters.minPrice !== undefined) {
      query = query.gte("price", filters.minPrice);
    }

    if (filters.maxPrice !== undefined) {
      query = query.lte("price", filters.maxPrice);
    }

    if (filters.brand) {
      query = query.ilike("brand", `%${filters.brand}%`);
    }

    if (filters.tags && filters.tags.length > 0) {
      query = query.overlaps("tags", filters.tags);
    }

    if (filters.isFeatured !== undefined) {
      query = query.eq("is_featured", filters.isFeatured);
    }

    if (filters.inStock) {
      query = query.gt("stock_quantity", 0);
    }

    // Apply sorting
    const sortBy = filters.sortBy || "created_at";
    const sortOrder = filters.sortOrder || "desc";
    query = query.order(sortBy, { ascending: sortOrder === "asc" });

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("category_id", categoryId)
      .eq("is_active", true);

    if (countError) {
      return {
        success: false,
        error: "Không thể đếm số lượng sản phẩm",
      };
    }

    // Apply pagination
    const offset = (pagination.page - 1) * pagination.limit;
    query = query.range(offset, offset + pagination.limit - 1);

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
      category,
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
      error: "Đã xảy ra lỗi không mong muốn khi lấy sản phẩm danh mục",
    };
  }
} 