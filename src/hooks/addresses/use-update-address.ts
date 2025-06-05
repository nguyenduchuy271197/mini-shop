"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAddress } from "@/actions/addresses/update-address";
import { useToast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { AddressType } from "@/types/custom.types";

export interface UpdateAddressData {
  addressId: number;
  type?: AddressType;
  first_name?: string;
  last_name?: string;
  company?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  is_default?: boolean;
}

function isClientError(error: Error): boolean {
  return error.message.includes("validation") || 
         error.message.includes("required") ||
         error.message.includes("invalid");
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: UpdateAddressData) => updateAddress(data),
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
          : "Không thể cập nhật địa chỉ. Vui lòng thử lại sau.",
      });
    },
    retry: (failureCount: number, error: Error) => {
      return !isClientError(error) && failureCount < 3;
    },
  });
} 