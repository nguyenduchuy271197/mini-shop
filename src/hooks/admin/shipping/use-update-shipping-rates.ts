"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateShippingRates } from "@/actions/admin/shipping/update-shipping-rates";
import { useToast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";

interface ShippingRateData {
  name: string;
  description?: string;
  cost: number;
  free_shipping_threshold?: number;
  estimated_days_min: number;
  estimated_days_max: number;
  weight_based?: boolean;
  weight_rates?: Array<{
    min_weight: number;
    max_weight: number;
    rate: number;
  }>;
  is_active?: boolean;
}

interface UpdateShippingRatesData {
  zoneId: number;
  rates: ShippingRateData[];
}

interface ShippingRate {
  id: number;
  zone_id: number;
  name: string;
  description: string | null;
  cost: number;
  free_shipping_threshold: number | null;
  estimated_days_min: number;
  estimated_days_max: number;
  weight_based: boolean;
  weight_rates: Array<{
    min_weight: number;
    max_weight: number;
    rate: number;
  }> | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface UpdateShippingRatesResponse {
  success: true;
  message: string;
  rates: ShippingRate[];
}

interface UseUpdateShippingRatesOptions {
  onSuccess?: (result: UpdateShippingRatesResponse) => void;
  onError?: (error: string) => void;
}

function isClientError(error: Error): boolean {
  return error.message.includes("ID khu vực giao hàng không hợp lệ") ||
         error.message.includes("Tên phương thức giao hàng phải có ít nhất") ||
         error.message.includes("Phí giao hàng không thể âm") ||
         error.message.includes("Ngưỡng freeship không thể âm") ||
         error.message.includes("Số ngày ước tính") ||
         error.message.includes("Phải có ít nhất một phương thức giao hàng") ||
         error.message.includes("chưa được xác thực") ||
         error.message.includes("Chỉ admin");
}

export function useUpdateShippingRates(options: UseUpdateShippingRatesOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ zoneId, rates }: UpdateShippingRatesData) => {
      const processedRates = rates.map(rate => ({
        ...rate,
        weight_based: rate.weight_based ?? false,
        is_active: rate.is_active ?? true
      }));
      const result = await updateShippingRates(zoneId, processedRates);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as UpdateShippingRatesResponse;
    },
    onSuccess: (result) => {
      // Show success toast
      toast({
        title: "Cập nhật phí giao hàng thành công",
        description: result.message,
      });

      // Invalidate and refetch shipping zones and rates
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.admin.shipping.all,
      });

      options.onSuccess?.(result);
    },
    onError: (error: Error) => {
      const isClientErr = isClientError(error);
      
      toast({
        title: isClientErr ? "Không thể cập nhật phí giao hàng" : "Lỗi hệ thống",
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
  ShippingRateData,
  UpdateShippingRatesData, 
  ShippingRate,
  UpdateShippingRatesResponse,
  UseUpdateShippingRatesOptions 
}; 