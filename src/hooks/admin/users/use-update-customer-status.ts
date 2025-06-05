"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { updateCustomerStatus } from "@/actions/admin/users/update-customer-status";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@/types/custom.types";

interface UpdateCustomerStatusData {
  customerId: string;
  isActive: boolean;
  reason?: string;
}

interface UseUpdateCustomerStatusOptions {
  onSuccess?: (result: { customer: Profile; message: string }) => void;
  onError?: (error: string) => void;
}

function isClientError(error: Error): boolean {
  return error.message.includes("không hợp lệ") || 
         error.message.includes("không tìm thấy") ||
         error.message.includes("không thể thay đổi trạng thái của chính mình") ||
         error.message.includes("đơn hàng đang xử lý");
}

export function useUpdateCustomerStatus(options: UseUpdateCustomerStatusOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateCustomerStatusData) => {
      const result = await updateCustomerStatus(data);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result;
    },
    onSuccess: (result, variables) => {
      // Invalidate and refetch admin customers list
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.admin.users.customers(),
      });

      // Invalidate specific customer details
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.admin.users.customerDetails(variables.customerId),
      });

      // Invalidate customer orders since status change might affect them
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.admin.users.customerOrders(variables.customerId),
      });

      // If customer was deactivated, also invalidate cart and related data
      if (!variables.isActive) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.cart.all,
        });
      }

      toast({
        title: "Thành công",
        description: result.message,
      });

      options.onSuccess?.({
        customer: result.customer,
        message: result.message,
      });
    },
    onError: (error: Error) => {
      const isClientErr = isClientError(error);
      
      toast({
        title: isClientErr ? "Không thể cập nhật" : "Lỗi hệ thống",
        description: error.message,
        variant: "destructive",
      });

      options.onError?.(error.message);
    },
    retry: (failureCount, error) => {
      // Don't retry on client errors (validation, business logic constraints)
      if (isClientError(error as Error)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export type { UpdateCustomerStatusData, UseUpdateCustomerStatusOptions }; 