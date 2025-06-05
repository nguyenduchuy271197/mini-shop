"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getBanners } from "@/actions/admin/banners/get-banners";

interface BannerFilters {
  isActive?: boolean;
  position?: "hero" | "sidebar" | "footer" | "popup" | "category";
}

interface UseAdminBannersParams {
  filters?: BannerFilters;
}

interface Banner {
  id: number;
  title: string;
  description: string | null;
  image_url: string;
  link_url: string | null;
  position: "hero" | "sidebar" | "footer" | "popup" | "category";
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  target_type: "_blank" | "_self";
  priority: number;
  created_at: string;
  updated_at: string;
}

interface AdminBannersResponse {
  success: true;
  banners: Banner[];
  total: number;
}

export function useAdminBanners(params: UseAdminBannersParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.banners.list(params),
    queryFn: async () => {
      const result = await getBanners(params.filters);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as AdminBannersResponse;
    },
    retry: (failureCount, error) => {
      // Don't retry on authorization errors
      if (error.message.includes("chưa được xác thực") || 
          error.message.includes("Chỉ admin")) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 1000 * 60 * 5, // Banners don't change frequently, cache for 5 minutes
  });
}

export type { 
  BannerFilters, 
  UseAdminBannersParams, 
  Banner, 
  AdminBannersResponse 
}; 