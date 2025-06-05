"use client";

import { useQuery } from "@tanstack/react-query";
import { calculateShippingCost } from "@/actions/admin/shipping/calculate-shipping";
import { AddressData } from "@/types/custom.types";

interface CartItem {
  product_id: number;
  quantity: number;
  weight?: number;
}

interface UseCalculateShippingParams {
  address: AddressData;
  items: CartItem[];
}

interface ShippingOption {
  id: number;
  name: string;
  description: string | null;
  cost: number;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  isFreeShipping: boolean;
}

interface CalculateShippingResponse {
  success: true;
  shippingOptions: ShippingOption[];
  totalWeight: number;
  totalValue: number;
}

export function useCalculateShipping(params: UseCalculateShippingParams) {
  return useQuery({
    queryKey: ["shipping", "calculation", params],
    queryFn: async () => {
      const result = await calculateShippingCost(params.address, params.items);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as CalculateShippingResponse;
    },
    retry: (failureCount, error) => {
      // Don't retry on validation errors
      if (error.message.includes("Mã quốc gia không hợp lệ") ||
          error.message.includes("không thể trống") ||
          error.message.includes("Phải có ít nhất một sản phẩm") ||
          error.message.includes("Không có phương thức giao hàng nào phù hợp")) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    enabled: !!(
      params.address?.country && 
      params.address?.state && 
      params.address?.city && 
      params.address?.postal_code &&
      params.items?.length > 0
    ),
  });
}

export type { 
  UseCalculateShippingParams,
  CartItem, 
  ShippingOption,
  CalculateShippingResponse 
}; 