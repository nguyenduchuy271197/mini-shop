"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  ShoppingBag,
  Heart,
  CreditCard,
  Package,
  AlertCircle,
  LoaderCircle,
  TrendingUp,
  Award,
} from "lucide-react";
import { useCustomerDetails, useCustomerOrders } from "@/hooks/admin/users";
import {
  getCustomerStatusText,
  getCustomerStatusBadgeVariant,
  formatCustomerJoinDate,
  getGenderDisplayText,
  calculateCustomerLifetimeValue,
} from "../_lib/utils";
import { formatCurrency } from "@/lib/utils";

interface AdminCustomerDetailDialogProps {
  customerId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminCustomerDetailDialog({
  customerId,
  open,
  onOpenChange,
}: AdminCustomerDetailDialogProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const {
    data: customerDetails,
    isLoading: isLoadingDetails,
    error: detailsError,
  } = useCustomerDetails({
    customerId: customerId || "",
  });

  const {
    data: customerOrders,
    isLoading: isLoadingOrders,
    error: ordersError,
  } = useCustomerOrders({
    customerId: customerId || "",
    includeItems: true,
  });

  if (!customerId) return null;

  const renderLoadingState = () => (
    <div className="flex items-center justify-center py-8">
      <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );

  const renderErrorState = (error: string) => (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-muted-foreground">{error}</p>
    </div>
  );

  const renderCustomerInfo = () => {
    if (isLoadingDetails) return renderLoadingState();
    if (detailsError) return renderErrorState(detailsError.message);
    if (!customerDetails) return null;

    const { value: lifetimeValue, tier } = calculateCustomerLifetimeValue(
      customerDetails.statistics.total_spent
    );
    const statusText = getCustomerStatusText(
      customerDetails.statistics.total_orders
    );
    const statusVariant = getCustomerStatusBadgeVariant(
      customerDetails.statistics.total_orders
    );

    return (
      <div className="space-y-6">
        {/* Customer Header */}
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={customerDetails.avatar_url || undefined}
              alt={customerDetails.full_name || customerDetails.email}
            />
            <AvatarFallback className="text-lg">
              {(customerDetails.full_name || customerDetails.email)
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-semibold">
                {customerDetails.full_name || "Chưa cập nhật"}
              </h2>
              <Badge variant={statusVariant}>{statusText}</Badge>
              <Badge
                variant="outline"
                className={`${
                  tier === "platinum"
                    ? "border-purple-300 text-purple-700 bg-purple-50"
                    : tier === "gold"
                    ? "border-yellow-300 text-yellow-700 bg-yellow-50"
                    : tier === "silver"
                    ? "border-gray-300 text-gray-700 bg-gray-50"
                    : "border-orange-300 text-orange-700 bg-orange-50"
                }`}
              >
                <Award className="mr-1 h-3 w-3" />
                {tier.toUpperCase()}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {customerDetails.email}
              </div>
              {customerDetails.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {customerDetails.phone}
                </div>
              )}
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                {getGenderDisplayText(customerDetails.gender)}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {formatCustomerJoinDate(customerDetails.created_at)}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Tổng đơn hàng</span>
              </div>
              <p className="text-2xl font-bold">
                {customerDetails.statistics.total_orders}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Tổng chi tiêu</span>
              </div>
              <p className="text-2xl font-bold">{lifetimeValue}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">AOV trung bình</span>
              </div>
              <p className="text-2xl font-bold">
                {formatCurrency(customerDetails.statistics.average_order_value)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium">Yêu thích</span>
              </div>
              <p className="text-2xl font-bold">
                {customerDetails.activity_summary.items_in_wishlist}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Tóm tắt hoạt động</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {customerDetails.activity_summary.items_in_cart}
                </p>
                <p className="text-sm text-muted-foreground">
                  Sản phẩm trong giỏ
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {customerDetails.activity_summary.items_in_wishlist}
                </p>
                <p className="text-sm text-muted-foreground">
                  Sản phẩm yêu thích
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {customerDetails.activity_summary.reviews_count}
                </p>
                <p className="text-sm text-muted-foreground">
                  Đánh giá đã viết
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Addresses */}
        {customerDetails.addresses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Địa chỉ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {customerDetails.addresses.map((address) => (
                  <div
                    key={address.id}
                    className="flex items-start gap-3 p-3 border rounded-lg"
                  >
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          {address.first_name} {address.last_name}
                        </span>
                        <Badge
                          variant={
                            address.type === "shipping"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {address.type === "shipping"
                            ? "Giao hàng"
                            : "Thanh toán"}
                        </Badge>
                        {address.is_default && (
                          <Badge variant="outline">Mặc định</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {address.address_line_1}
                        {address.address_line_2 &&
                          `, ${address.address_line_2}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {address.city}, {address.state} {address.postal_code}
                      </p>
                      {address.phone && (
                        <p className="text-sm text-muted-foreground">
                          SĐT: {address.phone}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderOrderHistory = () => {
    if (isLoadingOrders) return renderLoadingState();
    if (ordersError) return renderErrorState(ordersError.message);
    if (!customerOrders?.orders.length) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Khách hàng chưa có đơn hàng nào
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {customerOrders.orders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium">#{order.order_number}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCustomerJoinDate(order.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {formatCurrency(order.total_amount)}
                  </p>
                  <Badge
                    variant={
                      order.status === "delivered"
                        ? "default"
                        : order.status === "cancelled"
                        ? "destructive"
                        : order.status === "processing"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {order.status === "pending" && "Chờ xử lý"}
                    {order.status === "confirmed" && "Đã xác nhận"}
                    {order.status === "processing" && "Đang xử lý"}
                    {order.status === "shipped" && "Đang giao"}
                    {order.status === "delivered" && "Đã giao"}
                    {order.status === "cancelled" && "Đã hủy"}
                    {order.status === "refunded" && "Đã hoàn tiền"}
                  </Badge>
                </div>
              </div>

              {order.order_items && order.order_items.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  {order.order_items.length} sản phẩm -
                  {order.order_items.reduce(
                    (sum, item) => sum + item.quantity,
                    0
                  )}{" "}
                  món
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết khách hàng</DialogTitle>
          <DialogDescription>
            Xem thông tin chi tiết và lịch sử hoạt động của khách hàng
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="orders">Lịch sử đơn hàng</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            {renderCustomerInfo()}
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            {renderOrderHistory()}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
