"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bulkUpdateOrderStatus } from "@/actions/admin/orders/bulk-update-orders";
import { useToast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";
import { OrderStatus } from "@/types/custom.types";

interface BulkUpdateOrdersData {
  orderIds: number[];
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
  notes?: string;
  notifyCustomers?: boolean;
}

interface UpdatedOrder {
  id: number;
  order_number: string;
  old_status: OrderStatus;
  new_status: OrderStatus;
  customer_email?: string;
}

interface FailedOrder {
  id: number;
  order_number?: string;
  error: string;
}

interface BulkUpdateOrdersResponse {
  success: true;
  message: string;
  updated: {
    count: number;
    orders: UpdatedOrder[];
  };
  failed: FailedOrder[];
}

interface UseBulkUpdateOrdersOptions {
  onSuccess?: (result: BulkUpdateOrdersResponse) => void;
  onError?: (error: string) => void;
}

function isClientError(error: Error): boolean {
  return error.message.includes("không có đơn hàng nào") ||
         error.message.includes("không thể cập nhật được") ||
         error.message.includes("không hợp lệ");
}

export function useBulkUpdateOrders(options: UseBulkUpdateOrdersOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BulkUpdateOrdersData) => {
      const processedData = {
        ...data,
        notifyCustomers: data.notifyCustomers ?? false,
      };
      
      const result = await bulkUpdateOrderStatus(processedData);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as BulkUpdateOrdersResponse;
    },
    onSuccess: (result) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.admin.orders.all 
      });
      
      // Also invalidate pending orders if status change affects them
      if (result.updated.orders.some(order => 
        order.old_status === "pending" || order.new_status === "pending"
      )) {
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.admin.orders.pending() 
        });
      }

      // Show success toast
      if (result.updated.count > 0) {
        toast({
          title: "Cập nhật thành công",
          description: `Đã cập nhật ${result.updated.count} đơn hàng${result.failed.length > 0 ? `, ${result.failed.length} đơn hàng thất bại` : ""}`,
        });
      }

      // Show warning for failed orders
      if (result.failed.length > 0 && result.updated.count === 0) {
        toast({
          title: "Không thể cập nhật",
          description: `${result.failed.length} đơn hàng không thể cập nhật được`,
          variant: "destructive",
        });
      }

      options.onSuccess?.(result);
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
      // Don't retry on client errors (authorization, validation, etc.)
      if (isClientError(error as Error)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export type { 
  BulkUpdateOrdersData, 
  UpdatedOrder, 
  FailedOrder,
  BulkUpdateOrdersResponse,
  UseBulkUpdateOrdersOptions 
}; 