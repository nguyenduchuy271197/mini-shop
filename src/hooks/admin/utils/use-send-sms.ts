"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendSMS } from "@/actions/utils/send-sms";
import { useToast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";

interface SendSMSData {
  phoneNumber: string;
  message: string;
  options?: {
    templateId?: string;
    templateData?: Record<string, string | number | boolean>;
    priority?: "low" | "normal" | "high";
    sendAt?: Date;
    trackDelivery?: boolean;
  };
}

interface SendSMSResponse {
  success: true;
  message: string;
  messageId: string;
  segments: number;
  cost: number;
  provider: string;
  scheduledFor?: string;
}

interface UseSendSMSOptions {
  onSuccess?: (result: SendSMSResponse) => void;
  onError?: (error: string) => void;
}

function isClientError(error: Error): boolean {
  return error.message.includes("Số điện thoại phải có ít nhất") ||
         error.message.includes("Số điện thoại không được vượt quá") ||
         error.message.includes("Số điện thoại không hợp lệ") ||
         error.message.includes("Nội dung tin nhắn là bắt buộc") ||
         error.message.includes("Nội dung tin nhắn không được vượt quá") ||
         error.message.includes("Đã vượt quá giới hạn gửi SMS") ||
         error.message.includes("Nội dung tin nhắn sau khi xử lý template");
}

export function useSendSMS(options: UseSendSMSOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SendSMSData) => {
      const result = await sendSMS(data.phoneNumber, data.message, data.options);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as SendSMSResponse;
    },
    onSuccess: (result) => {
      // Show success toast with SMS details
      toast({
        title: "Gửi SMS thành công",
        description: `${result.message} - ${result.segments} tin nhắn, chi phí: $${result.cost.toFixed(4)}`,
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
        title: isClientErr ? "Không thể gửi SMS" : "Lỗi hệ thống", 
        description: error.message,
        variant: "destructive",
      });

      options.onError?.(error.message);
    },
    retry: (failureCount, error) => {
      // Don't retry on client errors (validation, rate limits, etc.)
      if (isClientError(error as Error)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export type { 
  SendSMSData,
  SendSMSResponse,
  UseSendSMSOptions 
}; 