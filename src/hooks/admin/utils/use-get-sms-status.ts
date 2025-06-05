"use client";

import { useQuery } from "@tanstack/react-query";
import { getSMSStatus } from "@/actions/utils/send-sms";
import { QUERY_KEYS } from "@/lib/query-keys";

interface GetSMSStatusParams {
  messageId: string;
}

interface GetSMSStatusResponse {
  success: true;
  status: "sent" | "delivered" | "failed" | "pending";
  timestamp: string;
  errorCode?: string;
}

interface UseGetSMSStatusOptions {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
  refetchInterval?: number;
}

export function useGetSMSStatus(
  params: GetSMSStatusParams | null,
  options: UseGetSMSStatusOptions = {}
) {
  return useQuery({
    queryKey: params 
      ? QUERY_KEYS.admin.utils.smsStatus(params.messageId)
      : ["admin", "utils", "sms-status", "disabled"],
    queryFn: async () => {
      if (!params) {
        throw new Error("Message ID is required");
      }

      const result = await getSMSStatus(params.messageId);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as GetSMSStatusResponse;
    },
    enabled: Boolean(params?.messageId) && (options.enabled ?? true),
    staleTime: options.staleTime ?? 2 * 60 * 1000, // 2 minutes
    gcTime: options.gcTime ?? 5 * 60 * 1000, // 5 minutes
    refetchInterval: options.refetchInterval ?? 20 * 1000, // Refetch every 20 seconds for live status
    retry: (failureCount, error) => {
      // Don't retry on validation errors
      const errorMessage = (error as Error).message;
      if (
        errorMessage.includes("Message ID is required") ||
        errorMessage.includes("Đã xảy ra lỗi khi lấy trạng thái SMS")
      ) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export type { 
  GetSMSStatusParams, 
  GetSMSStatusResponse,
  UseGetSMSStatusOptions 
}; 