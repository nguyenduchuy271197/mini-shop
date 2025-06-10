"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock, Package, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStripePaymentStatus } from "@/hooks/payments/use-stripe-checkout";
import { useClearCart } from "@/hooks/cart";
import Link from "next/link";

interface SuccessContentProps {
  order: {
    id: number;
    order_number: string;
    status: string;
    total_amount: number;
    payments?: Array<{
      payment_method: string;
      status: string;
    }>;
    order_items?: Array<{
      id: number;
      product_name: string;
      quantity: number;
      unit_price: number;
      total_price: number;
    }>;
  };
  sessionId?: string;
}

export default function SuccessContent({
  order,
  sessionId,
}: SuccessContentProps) {
  const [verificationStatus, setVerificationStatus] = useState<
    "pending" | "success" | "failed"
  >("pending");
  const [cartCleared, setCartCleared] = useState(false);

  const clearCart = useClearCart();

  // Use real-time payment status polling for Stripe payments
  const { data: paymentStatusData } = useStripePaymentStatus(
    sessionId || "",
    !!sessionId
  );

  useEffect(() => {
    if (!sessionId) {
      // Non-Stripe payment (COD, VNPay, etc.) - clear cart immediately
      setVerificationStatus("success");

      // Clear cart for COD payments since no webhook will do it
      if (!cartCleared) {
        clearCart.mutate(undefined, {
          onSuccess: () => {
            setCartCleared(true);
            console.log("Cart cleared for COD payment");
          },
          onError: (error) => {
            console.error("Failed to clear cart for COD:", error);
          },
        });
      }
      return;
    }

    if (paymentStatusData?.success && paymentStatusData.payment) {
      const status = paymentStatusData.payment.status;
      if (status === "completed") {
        setVerificationStatus("success");
        // For Stripe payments, cart is cleared by webhook
      } else if (status === "failed") {
        setVerificationStatus("failed");
      }
      // Keep pending for other statuses
    }
  }, [sessionId, paymentStatusData, cartCleared, clearCart]);

  const getStatusIcon = () => {
    if (sessionId && verificationStatus === "pending") {
      return <Clock className="h-12 w-12 text-yellow-500" />;
    }
    if (verificationStatus === "success") {
      return <CheckCircle className="h-12 w-12 text-green-500" />;
    }
    return <XCircle className="h-12 w-12 text-red-500" />;
  };

  const getStatusMessage = () => {
    if (sessionId && verificationStatus === "pending") {
      return {
        title: "Đang xác thực thanh toán...",
        description:
          "Vui lòng đợi trong giây lát, chúng tôi đang xác thực thanh toán của bạn.",
      };
    }
    if (verificationStatus === "success") {
      return {
        title: "Đặt hàng thành công!",
        description:
          "Cảm ơn bạn đã mua hàng. Chúng tôi sẽ xử lý đơn hàng và giao hàng sớm nhất có thể.",
      };
    }
    return {
      title: "Thanh toán thất bại",
      description:
        "Có lỗi xảy ra trong quá trình thanh toán. Vui lòng liên hệ hỗ trợ hoặc thử lại.",
    };
  };

  const statusMessage = getStatusMessage();
  const stripePayment = order.payments?.find(
    (p) => p.payment_method === "stripe"
  );

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            {getStatusIcon()}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {statusMessage.title}
              </h1>
              <p className="text-gray-600 mt-2">{statusMessage.description}</p>
            </div>

            {verificationStatus === "pending" && (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Order Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Thông tin đơn hàng
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Mã đơn hàng</p>
              <p className="font-medium">{order.order_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Trạng thái đơn hàng</p>
              <Badge
                variant={order.status === "confirmed" ? "default" : "secondary"}
              >
                {order.status === "pending" && "Chờ xử lý"}
                {order.status === "confirmed" && "Đã xác nhận"}
                {order.status === "processing" && "Đang xử lý"}
                {order.status === "shipped" && "Đã giao vận"}
                {order.status === "delivered" && "Đã giao hàng"}
                {order.status === "cancelled" && "Đã hủy"}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phương thức thanh toán</p>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="font-medium">
                  {stripePayment
                    ? "Thẻ tín dụng (Stripe)"
                    : order.payments?.[0]?.payment_method === "cod"
                    ? "Thanh toán khi nhận hàng"
                    : order.payments?.[0]?.payment_method === "vnpay"
                    ? "VNPay"
                    : order.payments?.[0]?.payment_method === "momo"
                    ? "MoMo"
                    : "Khác"}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng tiền</p>
              <p className="font-bold text-lg text-primary">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(order.total_amount)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Sản phẩm đã đặt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {order.order_items?.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="font-medium">{item.product_name}</p>
                  <p className="text-sm text-gray-600">
                    Số lượng: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(item.total_price)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(item.unit_price)}{" "}
                    x {item.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild className="flex-1">
          <Link href="/dashboard/orders">Xem đơn hàng của tôi</Link>
        </Button>
        <Button variant="outline" asChild className="flex-1">
          <Link href="/products">Tiếp tục mua sắm</Link>
        </Button>
        {verificationStatus === "failed" && (
          <Button variant="destructive" asChild className="flex-1">
            <Link
              href={`/checkout/payment?order=${order.order_number}&retry=true`}
            >
              Thử thanh toán lại
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
