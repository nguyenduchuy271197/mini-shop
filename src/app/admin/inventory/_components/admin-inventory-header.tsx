"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Package, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";

export function AdminInventoryHeader() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Invalidate all admin products queries to refetch data
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.admin.products.all,
      });

      toast({
        title: "Làm mới thành công",
        description: "Đã làm mới dữ liệu kho hàng",
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
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
          <Package className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý kho hàng</h1>
          <p className="text-sm text-gray-600">
            Theo dõi và cập nhật tồn kho sản phẩm
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Refresh Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          {isRefreshing ? "Đang làm mới..." : "Làm mới"}
        </Button>
      </div>
    </div>
  );
}
