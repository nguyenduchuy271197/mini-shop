"use client";

import { useState } from "react";
import { useUserOrders } from "@/hooks/orders";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, RotateCcw } from "lucide-react";
import OrderCard from "./order-card";
import OrdersEmpty from "./orders-empty";
import type { OrderStatus } from "@/types/custom.types";

const orderStatusTabs = [
  { value: "all", label: "Tất cả", count: 0 },
  { value: "pending", label: "Chờ xử lý", count: 0 },
  { value: "confirmed", label: "Đã xác nhận", count: 0 },
  { value: "processing", label: "Đang xử lý", count: 0 },
  { value: "shipped", label: "Đang giao", count: 0 },
  { value: "delivered", label: "Đã giao", count: 0 },
  { value: "cancelled", label: "Đã hủy", count: 0 },
];

export default function OrdersList() {
  const [activeTab, setActiveTab] = useState("all");
  const {
    data: ordersData,
    isLoading,
    error,
  } = useUserOrders({
    status: activeTab === "all" ? undefined : (activeTab as OrderStatus),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="space-y-3">
                  {[...Array(2)].map((_, j) => (
                    <div key={j} className="flex space-x-3">
                      <div className="w-16 h-16 bg-gray-200 rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Package className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Có lỗi xảy ra
          </h3>
          <p className="text-gray-600 mb-4">
            Không thể tải danh sách đơn hàng. Vui lòng thử lại.
          </p>
          <Button onClick={() => window.location.reload()}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  const orders = (ordersData?.success ? ordersData.orders : []) || [];

  if (orders.length === 0) {
    return <OrdersEmpty />;
  }

  // Count orders by status for tabs
  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    acc.all = (acc.all || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const tabsWithCounts = orderStatusTabs.map((tab) => ({
    ...tab,
    count: statusCounts[tab.value] || 0,
  }));

  const filteredOrders =
    activeTab === "all"
      ? orders
      : orders.filter((order) => order.status === activeTab);

  return (
    <div className="space-y-6">
      {/* Status Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          {tabsWithCounts.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-xs">
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
              {tab.count > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {tab.count}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Không có đơn hàng
                </h3>
                <p className="text-gray-600">
                  Bạn chưa có đơn hàng nào với trạng thái này.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
