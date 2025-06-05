"use client";

import { useQuery } from "@tanstack/react-query";
import { generateSKUSuggestion } from "@/actions/utils/validate-sku";
import { QUERY_KEYS } from "@/lib/query-keys";

interface GenerateSKUSuggestionsParams {
  productName: string;
  categoryName?: string;
  brand?: string;
}

interface GenerateSKUSuggestionsResponse {
  success: true;
  suggestions: string[];
}

interface UseGenerateSKUSuggestionsOptions {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

export function useGenerateSKUSuggestions(
  params: GenerateSKUSuggestionsParams | null,
  options: UseGenerateSKUSuggestionsOptions = {}
) {
  return useQuery({
    queryKey: params 
      ? QUERY_KEYS.admin.utils.skuSuggestions(params.productName, params.categoryName, params.brand)
      : ["admin", "utils", "sku-suggestions", "disabled"],
    queryFn: async () => {
      if (!params) {
        throw new Error("Parameters are required");
      }

      const result = await generateSKUSuggestion(
        params.productName,
        params.categoryName,
        params.brand
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as GenerateSKUSuggestionsResponse;
    },
    enabled: Boolean(params?.productName) && (options.enabled ?? true),
    staleTime: options.staleTime ?? 5 * 60 * 1000, // 5 minutes
    gcTime: options.gcTime ?? 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on validation errors
      const errorMessage = (error as Error).message;
      if (
        errorMessage.includes("Đã xảy ra lỗi khi tạo gợi ý SKU")
      ) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export type { 
  GenerateSKUSuggestionsParams, 
  GenerateSKUSuggestionsResponse,
  UseGenerateSKUSuggestionsOptions 
}; 