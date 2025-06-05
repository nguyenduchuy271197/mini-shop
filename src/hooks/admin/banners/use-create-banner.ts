"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBanner } from "@/actions/admin/banners/create-banner";
import { useToast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";

interface CreateBannerData {
  title: string;
  description?: string;
  image_url: string;
  link_url?: string;
  position: "hero" | "sidebar" | "footer" | "popup" | "category";
  is_active?: boolean;
  start_date?: string;
  end_date?: string;
  target_type?: "_blank" | "_self";
  priority?: number;
}

interface CreatedBanner {
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

interface CreateBannerResponse {
  success: true;
  message: string;
  banner: CreatedBanner;
}

interface UseCreateBannerOptions {
  onSuccess?: (result: CreateBannerResponse) => void;
  onError?: (error: string) => void;
}

function isClientError(error: Error): boolean {
  return error.message.includes("Tiêu đề banner là bắt buộc") ||
         error.message.includes("URL hình ảnh không hợp lệ") ||
         error.message.includes("URL liên kết không hợp lệ") ||
         error.message.includes("Vị trí banner không hợp lệ") ||
         error.message.includes("Kiểu target không hợp lệ") ||
         error.message.includes("Ngày kết thúc phải sau ngày bắt đầu") ||
         error.message.includes("chưa được xác thực") ||
         error.message.includes("Chỉ admin");
}

export function useCreateBanner(options: UseCreateBannerOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBannerData) => {
      const result = await createBanner({
        title: data.title,
        description: data.description,
        image_url: data.image_url,
        link_url: data.link_url,
        position: data.position,
        is_active: data.is_active ?? true,
        start_date: data.start_date,
        end_date: data.end_date,
        target_type: data.target_type ?? "_self",
        priority: data.priority ?? 0,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as CreateBannerResponse;
    },
    onSuccess: (result) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.admin.banners.all 
      });

      // Show success toast
      toast({
        title: "Tạo banner thành công",
        description: result.message,
      });

      options.onSuccess?.(result);
    },
    onError: (error: Error) => {
      const isClientErr = isClientError(error);
      
      toast({
        title: isClientErr ? "Không thể tạo banner" : "Lỗi hệ thống",
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
  CreateBannerData, 
  CreatedBanner, 
  CreateBannerResponse,
  UseCreateBannerOptions 
}; 