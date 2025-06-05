"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendBulkSMS } from "@/actions/utils/send-sms";
import { useToast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";

interface SendBulkSMSData {
  phoneNumbers: string[];
  message: string;
  options?: {
    templateId?: string;
    templateData?: Record<string, string | number | boolean>;
    priority?: "low" | "normal" | "high";
    batchSize?: number;
  };
}

interface SendBulkSMSResponse {
  success: true;
  results: Array<{
    phoneNumber: string;
    messageId?: string;
    success: boolean;
    error?: string;
  }>;
  totalSent: number;
  totalFailed: number;
}

interface UseSendBulkSMSOptions {
  onSuccess?: (result: SendBulkSMSResponse) => void;
  onError?: (error: string) => void;
}

function isClientError(error: Error): boolean {
  return error.message.includes("Không được gửi SMS cho quá 1000 số điện thoại") ||
         error.message.includes("Đã xảy ra lỗi khi gửi SMS hàng loạt") ||
         error.message.includes("Số điện thoại phải có ít nhất") ||
         error.message.includes("Nội dung tin nhắn là bắt buộc");
}

export function useSendBulkSMS(options: UseSendBulkSMSOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SendBulkSMSData) => {
      const result = await sendBulkSMS(
        data.phoneNumbers,
        data.message,
        data.options
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as SendBulkSMSResponse;
    },
    onSuccess: (result) => {
      // Show success toast with bulk SMS details
      toast({
        title: "Gửi SMS hàng loạt hoàn tất",
        description: `Thành công: ${result.totalSent}, Thất bại: ${result.totalFailed} từ ${result.results.length} số điện thoại`,
      });

      // Invalidate admin utils queries
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.admin.utils.all,
      });

      options.onSuccess?.(result);
    },
    onError: (error: Error) => {
      const isClientErr = isClientError(error);
      
      toast({
        title: isClientErr ? "Không thể gửi SMS hàng loạt" : "Lỗi hệ thống", 
        description: error.message,
        variant: "destructive",
      });

      options.onError?.(error.message);
    },
    retry: (failureCount, error) => {
      // Don't retry on client errors (validation, limits, etc.)
      if (isClientError(error as Error)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export type { 
  SendBulkSMSData,
  SendBulkSMSResponse,
  UseSendBulkSMSOptions 
}; 