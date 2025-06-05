"use client";

import { useQuery } from "@tanstack/react-query";
import { sanitizeContent } from "@/actions/utils/sanitize-content";
import { QUERY_KEYS } from "@/lib/query-keys";

interface SanitizeContentParams {
  content: string;
  options?: {
    allowedTags?: string[];
    allowedAttributes?: Record<string, string[]>;
    removeScripts?: boolean;
    removeStyles?: boolean;
    allowLinks?: boolean;
    allowImages?: boolean;
    maxLength?: number;
  };
}

interface SanitizeContentResponse {
  success: true;
  sanitizedContent: string;
  removedElements: string[];
  warnings: string[];
  originalLength: number;
  sanitizedLength: number;
}

interface UseSanitizeContentOptions {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

export function useSanitizeContent(
  params: SanitizeContentParams | null,
  options: UseSanitizeContentOptions = {}
) {
  return useQuery({
    queryKey: params 
      ? QUERY_KEYS.admin.utils.sanitize(params.content)
      : ["admin", "utils", "sanitize", "disabled"],
    queryFn: async () => {
      if (!params) {
        throw new Error("Parameters are required");
      }

      const result = await sanitizeContent(params.content, params.options);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as SanitizeContentResponse;
    },
    enabled: Boolean(params?.content) && (options.enabled ?? true),
    staleTime: options.staleTime ?? 10 * 60 * 1000, // 10 minutes
    gcTime: options.gcTime ?? 30 * 60 * 1000, // 30 minutes
    retry: (failureCount, error) => {
      // Don't retry on validation errors
      const errorMessage = (error as Error).message;
      if (
        errorMessage.includes("Nội dung không được vượt quá 100.000 ký tự") ||
        errorMessage.includes("sanitize nội dung")
      ) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export type { 
  SanitizeContentParams, 
  SanitizeContentResponse,
  UseSanitizeContentOptions 
}; 