"use client";

import { useQuery } from "@tanstack/react-query";
import { getEmailStatus } from "@/actions/utils/send-email";
import { QUERY_KEYS } from "@/lib/query-keys";

interface GetEmailStatusParams {
  messageId: string;
}

interface GetEmailStatusResponse {
  success: true;
  status: "sent" | "delivered" | "bounced" | "spam" | "opened" | "clicked";
  timestamp: string;
}

interface UseGetEmailStatusOptions {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
  refetchInterval?: number;
}

export function useGetEmailStatus(
  params: GetEmailStatusParams | null,
  options: UseGetEmailStatusOptions = {}
) {
  return useQuery({
    queryKey: params 
      ? QUERY_KEYS.admin.utils.emailStatus(params.messageId)
      : ["admin", "utils", "email-status", "disabled"],
    queryFn: async () => {
      if (!params) {
        throw new Error("Message ID is required");
      }

      const result = await getEmailStatus(params.messageId);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as GetEmailStatusResponse;
    },
    enabled: Boolean(params?.messageId) && (options.enabled ?? true),
    staleTime: options.staleTime ?? 2 * 60 * 1000, // 2 minutes
    gcTime: options.gcTime ?? 5 * 60 * 1000, // 5 minutes
    refetchInterval: options.refetchInterval ?? 30 * 1000, // Refetch every 30 seconds for live status
    retry: (failureCount, error) => {
      // Don't retry on validation errors
      const errorMessage = (error as Error).message;
      if (
        errorMessage.includes("Message ID is required") ||
        errorMessage.includes("Đã xảy ra lỗi khi lấy trạng thái email")
      ) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export type { 
  GetEmailStatusParams, 
  GetEmailStatusResponse,
  UseGetEmailStatusOptions 
}; 