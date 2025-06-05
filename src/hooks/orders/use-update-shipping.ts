"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOrderShippingAddress } from "@/actions/orders/update-shipping-address";
import { useToast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { AddressData } from "@/types/custom.types";

export interface UpdateShippingAddressData {
  orderId: number;
  address: AddressData;
}

export function useUpdateShippingAddress() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: UpdateShippingAddressData) => updateOrderShippingAddress(data),
    onSuccess: (result, variables) => {
      if (result.success) {
        toast({
          title: "Thành công",
          description: result.message,
        });
        
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders.all });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders.detail(variables.orderId.toString()) });
      } else {
        toast({
          title: "Lỗi",
          description: result.error,
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message || "Có lỗi xảy ra khi cập nhật địa chỉ giao hàng",
        variant: "destructive",
      });
    },
  });
} 