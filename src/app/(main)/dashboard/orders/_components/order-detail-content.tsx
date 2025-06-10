"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  MapPin,
  CreditCard,
  Truck,
  Phone,
  RotateCcw,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useOrder, useCancelOrder, useReorder } from "@/hooks/orders";

import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface OrderDetailContentProps {
  orderId: number;
}

interface OrderWithPayment {
  id: number;
  order_number: string;
  status: string;
  payment_status: string;
  subtotal: number;
  discount_amount?: number | null;
  shipping_amount?: number | null;
  tax_amount?: number | null;
  total_amount: number;
  notes?: string | null;
  created_at: string;
  shipping_address: {
    first_name: string;
    last_name: string;
    company?: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    postal_code: string;
    phone?: string;
  };
  billing_address: {
    first_name: string;
    last_name: string;
    company?: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    postal_code: string;
    phone?: string;
  };
  payment_method?: string;
  payment_date?: string;
  order_items?: Array<{
    id: number;
    quantity: number;
    unit_price: number;
    total_price: number;
    product?: { name: string; slug: string; images?: string[] };
  }>;
}

const statusConfig = {
  pending: {
    label: "Chờ xử lý",
    color: "bg-yellow-100 text-yellow-800",
    icon: <Clock className="w-4 h-4" />,
  },
  confirmed: {
    label: "Đã xác nhận",
    color: "bg-blue-100 text-blue-800",
    icon: <CheckCircle className="w-4 h-4" />,
  },
  processing: {
    label: "Đang xử lý",
    color: "bg-purple-100 text-purple-800",
    icon: <Package className="w-4 h-4" />,
  },
  shipped: {
    label: "Đang giao",
    color: "bg-orange-100 text-orange-800",
    icon: <Truck className="w-4 h-4" />,
  },
  delivered: {
    label: "Đã giao",
    color: "bg-green-100 text-green-800",
    icon: <CheckCircle className="w-4 h-4" />,
  },
  cancelled: {
    label: "Đã hủy",
    color: "bg-red-100 text-red-800",
    icon: <X className="w-4 h-4" />,
  },
  refunded: {
    label: "Đã hoàn tiền",
    color: "bg-gray-100 text-gray-800",
    icon: <RotateCcw className="w-4 h-4" />,
  },
};

export default function OrderDetailContent({
  orderId,
}: OrderDetailContentProps) {
  const { data: orderData, isLoading, error } = useOrder(orderId);
  const cancelOrder = useCancelOrder();
  const reorder = useReorder();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
  };

  const handleCancelOrder = () => {
    if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
      cancelOrder.mutate({
        orderId: orderId,
        reason: "Khách hàng yêu cầu hủy",
      });
    }
  };

  const handleReorder = () => {
    reorder.mutate({
      orderId: orderId,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !orderData?.success || !orderData.order) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Không tìm thấy đơn hàng
          </h3>
          <p className="text-gray-600 mb-4">
            Đơn hàng không tồn tại hoặc bạn không có quyền truy cập.
          </p>
          <Button asChild>
            <Link href="/dashboard/orders">Quay lại danh sách đơn hàng</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const order = orderData.order as unknown as OrderWithPayment;
  const canCancel = ["pending", "confirmed"].includes(order.status);
  const canReorder = ["delivered", "cancelled"].includes(order.status);
  const statusInfo =
    statusConfig[order.status as keyof typeof statusConfig] ||
    statusConfig.pending;

  return (
    <div className="space-y-6">
      {/* Order Status & Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Đơn hàng #{order.order_number}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Đặt hàng lúc {formatDate(order.created_at)}
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center gap-2">
              <Badge className={`${statusInfo.color} flex items-center gap-1`}>
                {statusInfo.icon}
                {statusInfo.label}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            {canReorder && (
              <Button
                variant="outline"
                onClick={handleReorder}
                disabled={reorder.isPending}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                {reorder.isPending ? "Đang xử lý..." : "Mua lại"}
              </Button>
            )}

            {canCancel && (
              <Button
                variant="destructive"
                onClick={handleCancelOrder}
                disabled={cancelOrder.isPending}
              >
                <X className="w-4 h-4 mr-2" />
                {cancelOrder.isPending ? "Đang hủy..." : "Hủy đơn hàng"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Sản phẩm đã đặt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.order_items?.map(
              (item: {
                id: number;
                quantity: number;
                unit_price: number;
                total_price: number;
                product?: { name: string; slug: string; images?: string[] };
              }) => (
                <div
                  key={item.id}
                  className="flex space-x-4 p-4 border rounded-lg"
                >
                  <div className="relative w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    {item.product?.images?.[0] ? (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">
                      {item.product?.name || "Sản phẩm không tồn tại"}
                    </h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Số lượng: {item.quantity}</p>
                      <p>Đơn giá: {formatPrice(item.unit_price)}</p>
                      <p className="font-medium">
                        Thành tiền: {formatPrice(item.total_price)}
                      </p>
                    </div>
                    {item.product && (
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto mt-2"
                        asChild
                      >
                        <Link href={`/products/${item.product.slug}`}>
                          Xem sản phẩm
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              )
            )}
          </div>

          <Separator className="my-4" />

          {/* Order Summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Tạm tính:</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {(order.discount_amount || 0) > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Giảm giá:</span>
                <span>-{formatPrice(order.discount_amount || 0)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span>Phí vận chuyển:</span>
              <span>{formatPrice(order.shipping_amount || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Thuế VAT:</span>
              <span>{formatPrice(order.tax_amount || 0)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Tổng cộng:</span>
              <span className="text-primary">
                {formatPrice(order.total_amount)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Địa chỉ giao hàng
            </CardTitle>
          </CardHeader>
          <CardContent>
            {order.shipping_address ? (
              <div className="space-y-2 text-sm">
                <p className="font-medium">
                  {order.shipping_address.first_name}{" "}
                  {order.shipping_address.last_name}
                </p>
                {order.shipping_address.company && (
                  <p className="text-gray-600">
                    {order.shipping_address.company}
                  </p>
                )}
                <p className="text-gray-600">
                  {order.shipping_address.address_line_1}
                  {order.shipping_address.address_line_2 &&
                    `, ${order.shipping_address.address_line_2}`}
                </p>
                <p className="text-gray-600">
                  {order.shipping_address.city}, {order.shipping_address.state}{" "}
                  {order.shipping_address.postal_code}
                </p>
                {order.shipping_address.phone && (
                  <p className="text-gray-600 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {order.shipping_address.phone}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Chưa có thông tin địa chỉ</p>
            )}
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Thông tin thanh toán
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Phương thức:</span>
                <span className="font-medium">
                  {order.payment_method === "cod"
                    ? "Thanh toán khi nhận hàng"
                    : order.payment_method === "vnpay"
                    ? "VNPay"
                    : order.payment_method === "stripe"
                    ? "Stripe"
                    : "Khác"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Trạng thái:</span>
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
                    : "Chưa thanh toán"}
                </Badge>
              </div>
              {order.payment_date && (
                <div className="flex justify-between">
                  <span>Ngày thanh toán:</span>
                  <span>{formatDate(order.payment_date!)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Notes */}
      {order.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Ghi chú đơn hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">{order.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
