"use client";

import { useMutation } from "@tanstack/react-query";
import { compressImage } from "@/actions/files/compress-image";
import { useToast } from "@/hooks/use-toast";

interface CompressImageData {
  file: File;
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

interface CompressImageResponse {
  success: true;
  message: string;
  compressedFile: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

interface UseCompressImageOptions {
  onSuccess?: (result: CompressImageResponse) => void;
  onError?: (error: string) => void;
}

function isClientError(error: Error): boolean {
  return error.message.includes("chưa được xác thực") ||
         error.message.includes("Chỉ hỗ trợ nén file hình ảnh") ||
         error.message.includes("Kích thước file input không được vượt quá");
}

export function useCompressImage(options: UseCompressImageOptions = {}) {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CompressImageData) => {
      const result = await compressImage(
        data.file, 
        data.quality, 
        data.maxWidth, 
        data.maxHeight
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as CompressImageResponse;
    },
    onSuccess: (result) => {
      // Show success toast with compression details
      toast({
        title: "Nén ảnh thành công",
        description: `${result.message} - Tiết kiệm ${result.compressionRatio}% dung lượng`,
      });

      options.onSuccess?.(result);
    },
    onError: (error: Error) => {
      const isClientErr = isClientError(error);
      
      toast({
        title: isClientErr ? "Không thể nén ảnh" : "Lỗi hệ thống", 
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
  CompressImageData, 
  CompressImageResponse,
  UseCompressImageOptions 
}; 