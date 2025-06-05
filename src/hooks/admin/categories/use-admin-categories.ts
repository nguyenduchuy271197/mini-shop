"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { createClient } from "@/lib/supabase/client";
import { Category } from "@/types/custom.types";

interface AdminCategoryFilters {
  parentId?: number | null;
  isActive?: boolean;
  searchTerm?: string;
}

interface UseAdminCategoriesParams extends AdminCategoryFilters {
  page?: number;
  limit?: number;
}

interface AdminCategoriesResponse {
  categories: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

async function getAdminCategories(params: UseAdminCategoriesParams = {}): Promise<AdminCategoriesResponse> {
  const supabase = createClient();
  
  const {
    parentId,
    isActive,
    searchTerm,
    page = 1,
    limit = 20,
  } = params;

  // Check admin authorization
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Bạn cần đăng nhập để xem danh sách categories admin");
  }

  // Check if user is admin
  const { data: userRole, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (roleError || !userRole || userRole.role !== "admin") {
    throw new Error("Bạn không có quyền xem danh sách categories admin");
  }

  // Build query
  let query = supabase
    .from("categories")
    .select("*", { count: "exact" });

  // Apply filters
  if (parentId !== undefined) {
    if (parentId === null) {
      query = query.is("parent_id", null);
    } else {
      query = query.eq("parent_id", parentId);
    }
  }

  if (isActive !== undefined) {
    query = query.eq("is_active", isActive);
  }

  if (searchTerm) {
    query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%`);
  }

  // Apply pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.range(from, to);

  // Order by sort_order, then by name
  query = query.order("sort_order", { ascending: true })
               .order("name", { ascending: true });

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message || "Không thể lấy danh sách categories");
  }

  const totalPages = Math.ceil((count || 0) / limit);

  return {
    categories: (data as Category[]) || [],
    total: count || 0,
    page,
    limit,
    totalPages,
  };
}

export function useAdminCategories(params: UseAdminCategoriesParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.categories.list(params),
    queryFn: () => getAdminCategories(params),
    staleTime: 30 * 1000, // 30 seconds
    retry: 1,
  });
}

export type { UseAdminCategoriesParams, AdminCategoriesResponse, AdminCategoryFilters }; 