"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createShippingZone } from "@/actions/admin/shipping/create-shipping-zone";
import { useToast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";

interface CreateShippingZoneData {
  name: string;
  description?: string;
  countries: string[];
  states?: string[];
  cities?: string[];
  is_active?: boolean;
}

interface CreatedShippingZone {
  id: number;
  name: string;
  description: string | null;
  countries: string[];
  states: string[] | null;
  cities: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface CreateShippingZoneResponse {
  success: true;
  message: string;
  zone: CreatedShippingZone;
}

interface UseCreateShippingZoneOptions {
  onSuccess?: (result: CreateShippingZoneResponse) => void;
  onError?: (error: string) => void;
}

function isClientError(error: Error): boolean {
  return error.message.includes("Tên khu vực giao hàng phải có ít nhất") ||
         error.message.includes("Mã quốc gia không hợp lệ") ||
         error.message.includes("Phải có ít nhất một quốc gia") ||
         error.message.includes("chưa được xác thực") ||
         error.message.includes("Chỉ admin");
}

export function useCreateShippingZone(options: UseCreateShippingZoneOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateShippingZoneData) => {
      const result = await createShippingZone({
        ...data,
        is_active: data.is_active ?? true
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as CreateShippingZoneResponse;
    },
    onSuccess: (result) => {
      // Show success toast
      toast({
        title: "Tạo khu vực giao hàng thành công",
        description: result.message,
      });

      // Invalidate and refetch shipping zones list
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.admin.shipping.all,
      });

      options.onSuccess?.(result);
    },
    onError: (error: Error) => {
      const isClientErr = isClientError(error);
      
      toast({
        title: isClientErr ? "Không thể tạo khu vực giao hàng" : "Lỗi hệ thống",
        description: error.message,
        variant: "destructive",
      });

      options.onError?.(error.message);
    },
    retry: (failureCount, error) => {
      // Don't retry on client errors (validation, authorization, etc.)
      if (isClientError(error as Error)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export type { 
  CreateShippingZoneData, 
  CreatedShippingZone,
  CreateShippingZoneResponse,
  UseCreateShippingZoneOptions 
}; 