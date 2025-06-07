"use client";

import { useState } from "react";
import { type OrderWithDetails } from "@/hooks/admin/orders";
import { formatCurrency } from "@/lib/utils";

type OrderAddress = {
  first_name: string;
  last_name: string;
  company?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
};
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  User,
  MapPin,
  CreditCard,
  Clock,
  Truck,
  Calendar,
  Phone,
  Mail,
  FileText,
} from "lucide-react";

interface AdminOrderDetailDialogProps {
  order: OrderWithDetails;
  children: React.ReactNode;
}

export function AdminOrderDetailDialog({
  order,
  children,
}: AdminOrderDetailDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Chờ xử lý", variant: "secondary" as const },
      confirmed: { label: "Đã xác nhận", variant: "outline" as const },
      processing: { label: "Đang xử lý", variant: "default" as const },
      shipped: { label: "Đã giao vận", variant: "outline" as const },
      delivered: { label: "Đã giao hàng", variant: "default" as const },
      cancelled: { label: "Đã hủy", variant: "destructive" as const },
      refunded: { label: "Đã hoàn tiền", variant: "outline" as const },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const shippingAddress = order.shipping_address as OrderAddress | null;
  const billingAddress = order.billing_address as OrderAddress | null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Chi tiết đơn hàng #{order.order_number}
          </DialogTitle>
          <DialogDescription>
            Thông tin chi tiết và trạng thái đơn hàng
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Trạng thái đơn hàng
                </CardTitle>
              </CardHeader>
              <CardContent>{getStatusBadge(order.status)}</CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge
                  variant={
                    order.payment_status === "paid" ? "default" : "secondary"
                  }
                >
                  {order.payment_status === "paid"
                    ? "Đã thanh toán"
                    : order.payment_status === "pending"
                    ? "Chờ thanh toán"
                    : order.payment_status === "failed"
                    ? "Thất bại"
                    : "Đã hoàn tiền"}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Tổng tiền
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  {formatCurrency(order.total_amount)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Thông tin khách hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="font-medium">
                    {order.customer?.full_name || "Khách vãng lai"}
                  </div>
                  {order.customer?.email && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Mail className="h-3 w-3" />
                      {order.customer.email}
                    </div>
                  )}
                  {order.customer?.phone && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Phone className="h-3 w-3" />
                      {order.customer.phone}
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Đặt hàng: {formatDate(order.created_at)}
                  </div>
                  {order.updated_at !== order.created_at && (
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      Cập nhật: {formatDate(order.updated_at)}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Addresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Địa chỉ giao hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                {shippingAddress && (
                  <div className="space-y-1 text-sm">
                    <div className="font-medium">
                      {shippingAddress.first_name} {shippingAddress.last_name}
                    </div>
                    {shippingAddress.company && (
                      <div className="text-gray-600">
                        {shippingAddress.company}
                      </div>
                    )}
                    <div>{shippingAddress.address_line_1}</div>
                    {shippingAddress.address_line_2 && (
                      <div>{shippingAddress.address_line_2}</div>
                    )}
                    <div>
                      {shippingAddress.city}, {shippingAddress.state}{" "}
                      {shippingAddress.postal_code}
                    </div>
                    <div>{shippingAddress.country}</div>
                    {shippingAddress.phone && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <Phone className="h-3 w-3" />
                        {shippingAddress.phone}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Billing Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Địa chỉ thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent>
                {billingAddress && (
                  <div className="space-y-1 text-sm">
                    <div className="font-medium">
                      {billingAddress.first_name} {billingAddress.last_name}
                    </div>
                    {billingAddress.company && (
                      <div className="text-gray-600">
                        {billingAddress.company}
                      </div>
                    )}
                    <div>{billingAddress.address_line_1}</div>
                    {billingAddress.address_line_2 && (
                      <div>{billingAddress.address_line_2}</div>
                    )}
                    <div>
                      {billingAddress.city}, {billingAddress.state}{" "}
                      {billingAddress.postal_code}
                    </div>
                    <div>{billingAddress.country}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Tóm tắt đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>

                {order.tax_amount && order.tax_amount > 0 && (
                  <div className="flex justify-between">
                    <span>Thuế:</span>
                    <span>{formatCurrency(order.tax_amount)}</span>
                  </div>
                )}

                {order.shipping_amount && order.shipping_amount > 0 && (
                  <div className="flex justify-between">
                    <span>Phí vận chuyển:</span>
                    <span>{formatCurrency(order.shipping_amount)}</span>
                  </div>
                )}

                {order.discount_amount && order.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá:</span>
                    <span>-{formatCurrency(order.discount_amount)}</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Tổng cộng:</span>
                  <span>{formatCurrency(order.total_amount)}</span>
                </div>
              </div>

              {/* Coupon */}
              {order.coupon_code && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <Package className="h-4 w-4" />
                    <span className="font-medium">
                      Mã giảm giá: {order.coupon_code}
                    </span>
                  </div>
                </div>
              )}

              {/* Shipping Method */}
              {order.shipping_method && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Truck className="h-4 w-4" />
                    <span className="font-medium">
                      Phương thức vận chuyển: {order.shipping_method}
                    </span>
                  </div>
                </div>
              )}

              {/* Tracking Number */}
              {order.tracking_number && (
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-purple-800">
                    <Package className="h-4 w-4" />
                    <span className="font-medium">
                      Mã vận đơn: {order.tracking_number}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {(order.notes || order.admin_notes) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Ghi chú
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.notes && (
                  <div>
                    <div className="font-medium text-sm text-gray-600 mb-1">
                      Ghi chú khách hàng:
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg text-sm">
                      {order.notes}
                    </div>
                  </div>
                )}
                {order.admin_notes && (
                  <div>
                    <div className="font-medium text-sm text-gray-600 mb-1">
                      Ghi chú admin:
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg text-sm">
                      {order.admin_notes}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
