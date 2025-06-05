"use client";

import { useQuery } from "@tanstack/react-query";
import { estimateDeliveryTime } from "@/actions/admin/shipping/estimate-delivery";
import { AddressData } from "@/types/custom.types";

interface UseEstimateDeliveryParams {
  address: AddressData;
  method: string;
}

interface DeliveryEstimate {
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  estimatedDeliveryDate: {
    earliest: string;
    latest: string;
  };
  shippingMethod: string;
  shippingZone: string;
  isBusinessDaysOnly: boolean;
  notes?: string;
}

interface EstimateDeliveryResponse {
  success: true;
  estimate: DeliveryEstimate;
}

export function useEstimateDelivery(params: UseEstimateDeliveryParams) {
  return useQuery({
    queryKey: ["shipping", "delivery", params],
    queryFn: async () => {
      const result = await estimateDeliveryTime(params.address, params.method);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as EstimateDeliveryResponse;
    },
    retry: (failureCount, error) => {
      // Don't retry on validation errors
      if (error.message.includes("Mã quốc gia không hợp lệ") ||
          error.message.includes("không thể trống") ||
          error.message.includes("Phương thức giao hàng không tồn tại") ||
          error.message.includes("không hỗ trợ") ||
          error.message.includes("không có sẵn")) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 1000 * 60 * 15, // Cache for 15 minutes (delivery estimates change less frequently)
    enabled: !!(
      params.address?.country && 
      params.address?.state && 
      params.address?.city && 
      params.address?.postal_code &&
      params.method
    ),
  });
}

export type { 
  UseEstimateDeliveryParams, 
  DeliveryEstimate,
  EstimateDeliveryResponse 
}; 