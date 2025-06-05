"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reorderBanners } from "@/actions/admin/banners/reorder-banners";
import { useToast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";

interface BannerOrder {
  id: number;
  priority: number;
}

interface ReorderBannersData {
  bannerOrders: BannerOrder[];
}

interface ReorderBannersResponse {
  success: true;
  message: string;
  updatedBanners: BannerOrder[];
}

interface UseReorderBannersOptions {
  onSuccess?: (result: ReorderBannersResponse) => void;
  onError?: (error: string) => void;
}

function isClientError(error: Error): boolean {
  return error.message.includes("ID banner không hợp lệ") ||
         error.message.includes("Priority phải từ 0 đến 100") ||
         error.message.includes("Phải có ít nhất một banner") ||
         error.message.includes("Không được trùng lặp ID banner") ||
         error.message.includes("Không được trùng lặp priority") ||
         error.message.includes("không tồn tại") ||
         error.message.includes("chưa được xác thực") ||
         error.message.includes("Chỉ admin");
}

export function useReorderBanners(options: UseReorderBannersOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ReorderBannersData) => {
      const result = await reorderBanners(data.bannerOrders);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as ReorderBannersResponse;
    },
    onSuccess: (result) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.admin.banners.all 
      });

      // Show success toast
      toast({
        title: "Sắp xếp banner thành công",
        description: result.message,
      });

      options.onSuccess?.(result);
    },
    onError: (error: Error) => {
      const isClientErr = isClientError(error);
      
      toast({
        title: isClientErr ? "Không thể sắp xếp banner" : "Lỗi hệ thống",
        description: error.message,
        variant: "destructive",
      });

      options.onError?.(error.message);
    },
    retry: (failureCount, error) => {
      // Don't retry on client errors (authorization, validation, etc.)
      if (isClientError(error as Error)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export type { 
  BannerOrder,
  ReorderBannersData, 
  ReorderBannersResponse,
  UseReorderBannersOptions 
}; 