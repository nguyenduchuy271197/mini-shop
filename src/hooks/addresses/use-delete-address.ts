"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAddress } from "@/actions/addresses/delete-address";
import { useToast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface DeleteAddressData {
  addressId: number;
}

function isClientError(error: Error): boolean {
  return error.message.includes("validation") || 
         error.message.includes("required") ||
         error.message.includes("không thể xóa");
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: DeleteAddressData) => deleteAddress(data),
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
          : "Không thể xóa địa chỉ. Vui lòng thử lại sau.",
      });
    },
    retry: (failureCount: number, error: Error) => {
      return !isClientError(error) && failureCount < 3;
    },
  });
} 