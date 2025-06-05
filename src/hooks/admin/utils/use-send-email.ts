"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendEmail, type EmailData } from "@/actions/utils/send-email";
import { useToast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";

interface SendEmailResponse {
  success: true;
  message: string;
  messageId: string;
  recipients: number;
  provider: string;
}

interface UseSendEmailOptions {
  onSuccess?: (result: SendEmailResponse) => void;
  onError?: (error: string) => void;
}

function isClientError(error: Error): boolean {
  return error.message.includes("Email không hợp lệ") ||
         error.message.includes("Email CC không hợp lệ") ||
         error.message.includes("Email BCC không hợp lệ") ||
         error.message.includes("Chủ đề email là bắt buộc") ||
         error.message.includes("Nội dung") ||
         error.message.includes("Tên file là bắt buộc") ||
         error.message.includes("Phải có ít nhất một trong") ||
         error.message.includes("Không được gửi email cho quá 100 người nhận") ||
         error.message.includes("Tổng kích thước file đính kèm");
}

export function useSendEmail(options: UseSendEmailOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (emailData: EmailData) => {
      const result = await sendEmail(emailData);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as SendEmailResponse;
    },
    onSuccess: (result) => {
      // Show success toast
      toast({
        title: "Gửi email thành công",
        description: `${result.message} (ID: ${result.messageId})`,
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
        title: isClientErr ? "Không thể gửi email" : "Lỗi hệ thống", 
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
  SendEmailResponse,
  UseSendEmailOptions 
}; 