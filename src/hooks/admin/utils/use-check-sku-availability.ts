"use client";

import { useQuery } from "@tanstack/react-query";
import { checkSKUAvailability } from "@/actions/utils/validate-sku";
import { QUERY_KEYS } from "@/lib/query-keys";

interface CheckSKUAvailabilityParams {
  skus: string[];
}

interface CheckSKUAvailabilityResponse {
  success: true;
  availability: Array<{ 
    sku: string; 
    isAvailable: boolean; 
    existingProduct?: { id: number; name: string } 
  }>;
}

interface UseCheckSKUAvailabilityOptions {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

export function useCheckSKUAvailability(
  params: CheckSKUAvailabilityParams | null,
  options: UseCheckSKUAvailabilityOptions = {}
) {
  return useQuery({
    queryKey: params 
      ? QUERY_KEYS.admin.utils.skuAvailability(params.skus)
      : ["admin", "utils", "sku-availability", "disabled"],
    queryFn: async () => {
      if (!params) {
        throw new Error("Parameters are required");
      }

      const result = await checkSKUAvailability(params.skus);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as CheckSKUAvailabilityResponse;
    },
    enabled: Boolean(params?.skus && params.skus.length > 0) && (options.enabled ?? true),
    staleTime: options.staleTime ?? 1 * 60 * 1000, // 1 minute
    gcTime: options.gcTime ?? 3 * 60 * 1000, // 3 minutes
    retry: (failureCount, error) => {
      // Don't retry on validation errors
      const errorMessage = (error as Error).message;
      if (
        errorMessage.includes("Lỗi khi kiểm tra availability của SKUs")
      ) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export type { 
  CheckSKUAvailabilityParams, 
  CheckSKUAvailabilityResponse,
  UseCheckSKUAvailabilityOptions 
}; 