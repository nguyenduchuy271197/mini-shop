"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getShippingZones } from "@/actions/admin/shipping/get-shipping-zones";
import { PaginationParams } from "@/types/custom.types";

interface UseShippingZonesParams {
  pagination?: PaginationParams;
  includeInactive?: boolean;
}

interface ShippingZone {
  id: number;
  name: string;
  description: string | null;
  countries: string[];
  states: string[] | null;
  cities: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  shipping_rates: Array<{
    id: number;
    name: string;
    description: string | null;
    cost: number;
    free_shipping_threshold: number | null;
    estimated_days_min: number;
    estimated_days_max: number;
    weight_based: boolean;
    is_active: boolean;
  }>;
}

interface ShippingZonesResponse {
  success: true;
  zones: ShippingZone[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useShippingZones(params: UseShippingZonesParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.shipping.zones(params),
    queryFn: async () => {
      const result = await getShippingZones(params.pagination, params.includeInactive);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as ShippingZonesResponse;
    },
    retry: (failureCount, error) => {
      // Don't retry on authorization errors
      if (error.message.includes("chưa được xác thực") || 
          error.message.includes("Chỉ admin")) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });
}

export type { 
  UseShippingZonesParams, 
  ShippingZone,
  ShippingZonesResponse 
}; 