"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setDefaultAddress } from "@/actions/addresses/set-default-address";
import { useToast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { AddressType } from "@/types/custom.types";

export interface SetDefaultAddressData {
  addressId: number;
  type: AddressType;
}

function isClientError(error: Error): boolean {
  return error.message.includes("validation") || 
         error.message.includes("required") ||
         error.message.includes("không phải là loại");
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: SetDefaultAddressData) => setDefaultAddress(data),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Thành công",
          description: result.message,
        });
        
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.addresses.all });
      } else {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: result.error,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: isClientError(error) 
          ? error.message 
          : "Không thể đặt địa chỉ mặc định. Vui lòng thử lại sau.",
      });
    },
    retry: (failureCount: number, error: Error) => {
      return !isClientError(error) && failureCount < 3;
    },
  });
} 