"use client";

import { useQuery } from "@tanstack/react-query";
import { getFileUrl } from "@/actions/files/get-file-url";
import { QUERY_KEYS } from "@/lib/query-keys";

interface GetFileUrlParams {
  filePath: string;
  bucket: string;
}

interface GetFileUrlResponse {
  success: true;
  publicUrl: string;
  signedUrl?: string;
}

interface UseGetFileUrlOptions {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

export function useGetFileUrl(
  params: GetFileUrlParams | null,
  options: UseGetFileUrlOptions = {}
) {
  return useQuery({
    queryKey: params 
      ? QUERY_KEYS.files.url(`${params.bucket}/${params.filePath}`)
      : ["files", "url", "disabled"],
    queryFn: async () => {
      if (!params) {
        throw new Error("Parameters are required");
      }

      const result = await getFileUrl(params.filePath, params.bucket);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as GetFileUrlResponse;
    },
    enabled: Boolean(params?.filePath && params?.bucket) && (options.enabled ?? true),
    staleTime: options.staleTime ?? 10 * 60 * 1000, // 10 minutes
    gcTime: options.gcTime ?? 15 * 60 * 1000, // 15 minutes
    retry: (failureCount, error) => {
      // Don't retry on validation or auth errors
      const errorMessage = (error as Error).message;
      if (
        errorMessage.includes("Đường dẫn file là bắt buộc") ||
        errorMessage.includes("Bucket name là bắt buộc") ||
        errorMessage.includes("File không tồn tại") ||
        errorMessage.includes("chưa được xác thực")
      ) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export type { 
  GetFileUrlParams, 
  GetFileUrlResponse,
  UseGetFileUrlOptions 
}; 