"use client";

import { useQuery } from "@tanstack/react-query";
import { generateSlug } from "@/actions/utils/generate-slug";
import { QUERY_KEYS } from "@/lib/query-keys";

interface GenerateSlugParams {
  text: string;
  type: "product" | "category";
  forceUnique?: boolean;
}

interface GenerateSlugResponse {
  success: true;
  slug: string;
  originalSlug: string;
  isUnique: boolean;
}

interface UseGenerateSlugOptions {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

export function useGenerateSlug(
  params: GenerateSlugParams | null,
  options: UseGenerateSlugOptions = {}
) {
  return useQuery({
    queryKey: params 
      ? QUERY_KEYS.admin.utils.slug(params.text, params.type)
      : ["admin", "utils", "slug", "disabled"],
    queryFn: async () => {
      if (!params) {
        throw new Error("Parameters are required");
      }

      const result = await generateSlug(
        params.text,
        params.type,
        params.forceUnique ?? true
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as GenerateSlugResponse;
    },
    enabled: Boolean(params?.text && params?.type) && (options.enabled ?? true),
    staleTime: options.staleTime ?? 2 * 60 * 1000, // 2 minutes
    gcTime: options.gcTime ?? 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on validation errors
      const errorMessage = (error as Error).message;
      if (
        errorMessage.includes("Văn bản là bắt buộc") ||
        errorMessage.includes("Văn bản không được vượt quá 200 ký tự") ||
        errorMessage.includes("Loại phải là") ||
        errorMessage.includes("Không thể tạo slug từ văn bản")
      ) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export type { 
  GenerateSlugParams, 
  GenerateSlugResponse,
  UseGenerateSlugOptions 
}; 