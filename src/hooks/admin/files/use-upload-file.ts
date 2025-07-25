"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadFile } from "@/actions/files/upload-file";
import { useToast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";

interface UploadFileData {
  file: File;
  bucket: string;
  path: string;
}

interface UploadFileResponse {
  success: true;
  message: string;
  filePath: string;
  publicUrl: string;
}

interface UseUploadFileOptions {
  onSuccess?: (result: UploadFileResponse) => void;
  onError?: (error: string) => void;
}

function isClientError(error: Error): boolean {
  return error.message.includes("Bucket name là bắt buộc") ||
         error.message.includes("Đường dẫn file là bắt buộc") ||
         error.message.includes("chưa được xác thực") ||
         error.message.includes("Kích thước file không được vượt quá") ||
         error.message.includes("Định dạng file không được hỗ trợ") ||
         error.message.includes("File là bắt buộc");
}

export function useUploadFile(options: UseUploadFileOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UploadFileData) => {
      // Create FormData to pass to server action
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('bucket', data.bucket);
      formData.append('path', data.path);

      const result = await uploadFile(formData);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as UploadFileResponse;
    },
    onSuccess: (result) => {
      // Show success toast
      toast({
        title: "Upload file thành công",
        description: result.message,
      });

      // Invalidate files queries
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.files.all,
      });

      options.onSuccess?.(result);
    },
    onError: (error: Error) => {
      const isClientErr = isClientError(error);
      
      toast({
        title: isClientErr ? "Không thể upload file" : "Lỗi hệ thống", 
        description: error.message,
        variant: "destructive",
      });

      options.onError?.(error.message);
    },
    retry: (failureCount, error) => {
      // Don't retry on client errors (validation, authorization, etc.)
      if (isClientError(error as Error)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export type { 
  UploadFileData, 
  UploadFileResponse,
  UseUploadFileOptions 
}; 