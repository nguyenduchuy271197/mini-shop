"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ShoppingCart, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";

export function AdminOrdersHeader() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Invalidate all admin orders queries to refetch data
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.admin.orders.all,
        }),
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.admin.payments.all,
        }),
      ]);

      toast({
        title: "Làm mới thành công",
        description: "Đã làm mới dữ liệu đơn hàng",
      });
    } catch (error) {
      console.error("Refresh error:", error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi làm mới dữ liệu",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <ShoppingCart className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
          <p className="text-gray-600 mt-1">
            Xem và cập nhật trạng thái đơn hàng
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RotateCcw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          {isRefreshing ? "Đang làm mới..." : "Làm mới"}
        </Button>
      </div>
    </div>
  );
}
