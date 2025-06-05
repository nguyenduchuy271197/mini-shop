"use client";

import { useQuery } from "@tanstack/react-query";
import { getSignedUploadUrl } from "@/actions/files/get-signed-upload-url";
import { QUERY_KEYS } from "@/lib/query-keys";

interface GetSignedUploadUrlParams {
  fileName: string;
  bucket: string;
  fileType?: string;
  maxSizeBytes?: number;
}

interface GetSignedUploadUrlResponse {
  success: true;
  uploadUrl: string;
  filePath: string;
  publicUrl: string;
  token: string;
}

interface UseGetSignedUploadUrlOptions {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

export function useGetSignedUploadUrl(
  params: GetSignedUploadUrlParams | null,
  options: UseGetSignedUploadUrlOptions = {}
) {
  return useQuery({
    queryKey: params 
      ? QUERY_KEYS.files.signedUploadUrl(params.fileName)
      : ["files", "signed-upload", "disabled"],
    queryFn: async () => {
      if (!params) {
        throw new Error("Parameters are required");
      }

      const result = await getSignedUploadUrl(
        params.fileName,
        params.bucket,
        params.fileType,
        params.maxSizeBytes
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as GetSignedUploadUrlResponse;
    },
    enabled: Boolean(params?.fileName && params?.bucket) && (options.enabled ?? true),
    staleTime: options.staleTime ?? 5 * 60 * 1000, // 5 minutes
    gcTime: options.gcTime ?? 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on validation or auth errors
      const errorMessage = (error as Error).message;
      if (
        errorMessage.includes("Tên file là bắt buộc") ||
        errorMessage.includes("Bucket name là bắt buộc") ||
        errorMessage.includes("Định dạng file không được hỗ trợ") ||
        errorMessage.includes("Kích thước file tối đa") ||
        errorMessage.includes("chưa được xác thực")
      ) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export type { 
  GetSignedUploadUrlParams, 
  GetSignedUploadUrlResponse,
  UseGetSignedUploadUrlOptions 
}; 