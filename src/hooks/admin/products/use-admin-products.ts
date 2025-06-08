"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { createClient } from "@/lib/supabase/client";
import { Product, ProductFilters, PaginationParams } from "@/types/custom.types";

// Extended filters for admin with additional search capabilities
interface AdminProductFilters extends ProductFilters {
  searchTerm?: string;
  lowStock?: boolean;
  outOfStock?: boolean;
  isActive?: boolean;
}

type UseAdminProductsParams = Partial<AdminProductFilters & PaginationParams>;

// Product with category relation
type ProductWithCategory = Product & {
  categories?: {
    id: number;
    name: string;
    slug: string;
  } | null;
};

interface AdminProductsResponse {
  products: ProductWithCategory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

async function getAdminProducts(params: UseAdminProductsParams = {}): Promise<AdminProductsResponse> {
  const supabase = createClient();
  
  const {
    category_id,
    is_featured,
    brand,
    min_price,
    max_price,
    in_stock,
    tags,
    lowStock,
    outOfStock,
    searchTerm,
    isActive,
    page = 1,
    limit = 20,
  } = params;

  // Check admin authorization
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Bạn cần đăng nhập để xem danh sách sản phẩm admin");
  }

  // Check if user is admin
  const { data: userRole, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (roleError || !userRole || userRole.role !== "admin") {
    throw new Error("Bạn không có quyền xem danh sách sản phẩm admin");
  }

  // Build query
  let query = supabase
    .from("products")
    .select(`
      *,
      categories (
        id,
        name,
        slug
      )
    `, { count: "exact" });

  // Apply filters
  if (category_id) {
    query = query.eq("category_id", category_id);
  }

  if (isActive !== undefined) {
    query = query.eq("is_active", isActive);
  }

  if (is_featured !== undefined) {
    query = query.eq("is_featured", is_featured);
  }

  if (brand) {
    query = query.ilike("brand", `%${brand}%`);
  }

  if (min_price !== undefined) {
    query = query.gte("price", min_price);
  }

  if (max_price !== undefined) {
    query = query.lte("price", max_price);
  }

  if (in_stock !== undefined) {
    if (in_stock) {
      query = query.gt("stock_quantity", 0);
    } else {
      query = query.eq("stock_quantity", 0);
    }
  }

  if (tags && tags.length > 0) {
    query = query.overlaps("tags", tags);
  }

  if (lowStock) {
    query = query.filter("stock_quantity", "lte", "low_stock_threshold");
  }

  if (outOfStock) {
    query = query.eq("stock_quantity", 0);
  }

  if (searchTerm) {
    query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`);
  }

  // Apply pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.range(from, to);

  // Order by created_at desc
  query = query.order("created_at", { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message || "Không thể lấy danh sách sản phẩm");
  }

  const totalPages = Math.ceil((count || 0) / limit);

  return {
    products: data || [],
    total: count || 0,
    page,
    limit,
    totalPages,
  };
}

export function useAdminProducts(params: UseAdminProductsParams = {}) {
  // Create a properly typed params object for the query key that includes admin-specific filters
  const queryParams = {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
    category_id: params.category_id,
    min_price: params.min_price,
    max_price: params.max_price,
    brand: params.brand,
    tags: params.tags,
    is_featured: params.is_featured,
    in_stock: params.in_stock,
    searchTerm: params.searchTerm,
    lowStock: params.lowStock,
    outOfStock: params.outOfStock,
    isActive: params.isActive,
  };

  return useQuery({
    queryKey: QUERY_KEYS.admin.products.list(queryParams),
    queryFn: () => getAdminProducts(params),
    staleTime: 30 * 1000, // 30 seconds
    retry: 1,
  });
}

export type { UseAdminProductsParams, AdminProductsResponse, ProductFilters, ProductWithCategory }; 