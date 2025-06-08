"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Eye, RotateCcw, X, Package, Calendar, CreditCard } from "lucide-react";
import { useCancelOrder, useReorder } from "@/hooks/orders";

import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface OrderCardProps {
  order: {
    id: number;
    order_number: string;
    status: string;
    created_at: string;
    total_amount: number;
    order_items?: Array<{
      id: number;
      quantity: number;
      price: number;
      product?: {
        name: string;
        slug: string;
        images?: string[];
      };
    }>;
    shipping_address?: {
      first_name: string;
      last_name: string;
      address_line_1: string;
      address_line_2?: string;
      city: string;
      state: string;
      postal_code: string;
    };
  };
}

const statusConfig = {
  pending: { label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-800" },
  processing: { label: "Đang xử lý", color: "bg-purple-100 text-purple-800" },
  shipped: { label: "Đang giao", color: "bg-orange-100 text-orange-800" },
  delivered: { label: "Đã giao", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-800" },
  refunded: { label: "Đã hoàn tiền", color: "bg-gray-100 text-gray-800" },
};

export default function OrderCard({ order }: OrderCardProps) {
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
        orderId: order.id,
        reason: "Khách hàng yêu cầu hủy",
      });
    }
  };

  const handleReorder = () => {
    reorder.mutate({
      orderId: order.id,
    });
  };

  const canCancel = ["pending", "confirmed"].includes(order.status);
  const canReorder = ["delivered", "cancelled"].includes(order.status);
  const statusInfo =
    statusConfig[order.status as keyof typeof statusConfig] ||
    statusConfig.pending;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        {/* Order Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-gray-900">
                Đơn hàng #{order.order_number}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(order.created_at)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <CreditCard className="h-3 w-3" />
                <span>{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>
          <div className="mt-2 sm:mt-0">
            <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
          </div>
        </div>

        {/* Order Items Preview */}
        <div className="space-y-3 mb-4">
          {order.order_items?.slice(0, 2).map((item) => (
            <div key={item.id} className="flex space-x-3">
              <div className="relative w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                {item.product?.images?.[0] ? (
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-4 w-4 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {item.product?.name || "Sản phẩm không tồn tại"}
                </h4>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Số lượng: {item.quantity}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            </div>
          ))}

          {order.order_items && order.order_items.length > 2 && (
            <div className="text-sm text-gray-600 text-center py-2">
              +{order.order_items.length - 2} sản phẩm khác
            </div>
          )}
        </div>

        <Separator className="my-4" />

        {/* Order Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/orders/${order.id}`}>
                <Eye className="w-4 h-4 mr-2" />
                Xem chi tiết
              </Link>
            </Button>

            {canReorder && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReorder}
                disabled={reorder.isPending}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                {reorder.isPending ? "Đang xử lý..." : "Mua lại"}
              </Button>
            )}
          </div>

          {canCancel && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleCancelOrder}
              disabled={cancelOrder.isPending}
            >
              <X className="w-4 h-4 mr-2" />
              {cancelOrder.isPending ? "Đang hủy..." : "Hủy đơn hàng"}
            </Button>
          )}
        </div>

        {/* Shipping Address */}
        {order.shipping_address && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h5 className="text-sm font-medium text-gray-900 mb-1">
              Địa chỉ giao hàng:
            </h5>
            <p className="text-sm text-gray-600">
              {order.shipping_address.first_name}{" "}
              {order.shipping_address.last_name}
            </p>
            <p className="text-sm text-gray-600">
              {order.shipping_address.address_line_1}
              {order.shipping_address.address_line_2 &&
                `, ${order.shipping_address.address_line_2}`}
            </p>
            <p className="text-sm text-gray-600">
              {order.shipping_address.city}, {order.shipping_address.state}{" "}
              {order.shipping_address.postal_code}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
