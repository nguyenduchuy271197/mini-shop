"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reorderItems } from "@/actions/orders/reorder";
import { useToast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface ReorderData {
  orderId: number;
}

export function useReorder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: ReorderData) => reorderItems(data),
    onSuccess: (result) => {
      if (result.success) {
        const { added_to_cart, unavailable_items } = result;
        
        if (added_to_cart > 0 && unavailable_items === 0) {
          toast({
            title: "Thành công",
            description: `Đã thêm ${added_to_cart} sản phẩm vào giỏ hàng`,
          });
        } else if (added_to_cart > 0 && unavailable_items > 0) {
          toast({
            title: "Thành công một phần",
            description: `Đã thêm ${added_to_cart} sản phẩm vào giỏ hàng. ${unavailable_items} sản phẩm không thể thêm`,
          });
        } else {
          toast({
            title: "Thông báo",
            description: "Không có sản phẩm nào có thể thêm vào giỏ hàng",
            variant: "destructive",
          });
        }
        
        // Invalidate cart queries
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart.all });
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
        description: error.message || "Có lỗi xảy ra khi đặt lại đơn hàng",
        variant: "destructive",
      });
    },
  });
} 