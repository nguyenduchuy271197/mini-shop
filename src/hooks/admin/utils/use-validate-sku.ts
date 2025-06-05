"use client";

import { useQuery } from "@tanstack/react-query";
import { validateSKU } from "@/actions/utils/validate-sku";
import { QUERY_KEYS } from "@/lib/query-keys";

interface ValidateSKUParams {
  sku: string;
  productId?: number;
}

interface ValidateSKUResponse {
  success: true;
  isValid: boolean;
  isUnique: boolean;
  formatErrors: string[];
  existingProduct?: { id: number; name: string; sku: string };
}

interface UseValidateSKUOptions {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

export function useValidateSKU(
  params: ValidateSKUParams | null,
  options: UseValidateSKUOptions = {}
) {
  return useQuery({
    queryKey: params 
      ? QUERY_KEYS.admin.utils.skuValidation(params.sku, params.productId)
      : ["admin", "utils", "sku-validation", "disabled"],
    queryFn: async () => {
      if (!params) {
        throw new Error("Parameters are required");
      }

      const result = await validateSKU(params.sku, params.productId);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as ValidateSKUResponse;
    },
    enabled: Boolean(params?.sku) && (options.enabled ?? true),
    staleTime: options.staleTime ?? 30 * 1000, // 30 seconds
    gcTime: options.gcTime ?? 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error) => {
      // Don't retry on validation errors
      const errorMessage = (error as Error).message;
      if (
        errorMessage.includes("SKU là bắt buộc") ||
        errorMessage.includes("SKU không được vượt quá 50 ký tự") ||
        errorMessage.includes("tính duy nhất của SKU")
      ) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export type { 
  ValidateSKUParams, 
  ValidateSKUResponse,
  UseValidateSKUOptions 
}; 