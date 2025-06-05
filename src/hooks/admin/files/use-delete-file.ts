"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteFile } from "@/actions/files/delete-file";
import { useToast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";

interface DeleteFileData {
  filePath: string;
  bucket: string;
}

interface DeleteFileResponse {
  success: true;
  message: string;
}

interface UseDeleteFileOptions {
  onSuccess?: (result: DeleteFileResponse) => void;
  onError?: (error: string) => void;
}

function isClientError(error: Error): boolean {
  return error.message.includes("Đường dẫn file là bắt buộc") ||
         error.message.includes("Bucket name là bắt buộc") ||
         error.message.includes("chưa được xác thực") ||
         error.message.includes("File không tồn tại") ||
         error.message.includes("đã bị xóa");
}

export function useDeleteFile(options: UseDeleteFileOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DeleteFileData) => {
      const result = await deleteFile(data.filePath, data.bucket);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as DeleteFileResponse;
    },
    onSuccess: (result) => {
      // Show success toast
      toast({
        title: "Xóa file thành công",
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
        title: isClientErr ? "Không thể xóa file" : "Lỗi hệ thống", 
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
  DeleteFileData, 
  DeleteFileResponse,
  UseDeleteFileOptions 
}; 