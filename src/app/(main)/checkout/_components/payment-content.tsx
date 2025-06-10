"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  CreditCard,
  Building2,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { useCreatePayment } from "@/hooks/payments";
import { useToast } from "@/hooks/use-toast";

interface PaymentContentProps {
  orderNumber: string;
  paymentMethod: string;
}

const paymentMethodConfig = {
  vnpay: {
    name: "VNPay",
    icon: <CreditCard className="w-6 h-6" />,
    description: "Thanh toán qua VNPay - Hỗ trợ thẻ ATM, Visa, Mastercard",
    color: "bg-blue-100 text-blue-800",
  },
  stripe: {
    name: "Stripe",
    icon: <CreditCard className="w-6 h-6" />,
    description: "Thanh toán bằng thẻ tín dụng/ghi nợ",
    color: "bg-purple-100 text-purple-800",
  },
  cod: {
    name: "Thanh toán khi nhận hàng",
    icon: <Building2 className="w-6 h-6" />,
    description: "Thanh toán tiền mặt khi nhận hàng",
    color: "bg-green-100 text-green-800",
  },
};

export default function PaymentContent({
  orderNumber,
  paymentMethod,
}: PaymentContentProps) {
  const { toast } = useToast();
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "processing" | "success" | "failed"
  >("pending");
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  const createPayment = useCreatePayment();
  // Note: We would need a paymentId to use this hook, for now we'll remove it
  // const { data: statusData } = usePaymentStatus(paymentId, { includeOrderInfo: true });

  const methodConfig =
    paymentMethodConfig[paymentMethod as keyof typeof paymentMethodConfig];

  useEffect(() => {
    if (paymentStatus === "processing" && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [paymentStatus, countdown]);

  // Payment status will be updated through other means (webhooks, polling, etc.)
  // useEffect(() => {
  //   if (statusData?.status === "paid") {
  //     setPaymentStatus("success");
  //   } else if (statusData?.status === "failed") {
  //     setPaymentStatus("failed");
  //   }
  // }, [statusData]);

  const handleStartPayment = () => {
    setPaymentStatus("processing");

    // For demo purposes, we'll simulate payment creation
    // In real implementation, you would need orderId and amount
    createPayment.mutate(
      {
        orderId: 1, // This should come from the actual order
        paymentMethod: paymentMethod as "vnpay" | "stripe" | "cod",
        amount: 100000, // This should come from the actual order total
        currency: "VND",
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            // For online payment methods, redirect to payment gateway
            if (paymentMethod === "vnpay" || paymentMethod === "stripe") {
              // In real implementation, the result would contain paymentUrl
              const mockPaymentUrl = `https://payment-gateway.example.com/pay?order=${orderNumber}`;
              setPaymentUrl(mockPaymentUrl);
              // window.location.href = mockPaymentUrl;
            } else {
              // For COD, mark as success
              setPaymentStatus("success");
            }
          } else {
            setPaymentStatus("failed");
            toast({
              title: "Lỗi",
              description: result.error || "Không thể khởi tạo thanh toán",
              variant: "destructive",
            });
          }
        },
        onError: () => {
          setPaymentStatus("failed");
        },
      }
    );
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (!methodConfig) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Phương thức thanh toán không hợp lệ
          </h3>
          <Button asChild>
            <Link href="/dashboard/orders">Quay lại đơn hàng</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center ${methodConfig.color}`}
          >
            {methodConfig.icon}
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Thanh toán qua {methodConfig.name}
          </h1>
          <p className="text-gray-600 mt-2">Đơn hàng #{orderNumber}</p>
        </div>
      </div>

      {/* Payment Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {paymentStatus === "pending" && (
              <Clock className="w-5 h-5 text-yellow-600" />
            )}
            {paymentStatus === "processing" && (
              <Clock className="w-5 h-5 text-blue-600" />
            )}
            {paymentStatus === "success" && (
              <CheckCircle className="w-5 h-5 text-green-600" />
            )}
            {paymentStatus === "failed" && (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}

            {paymentStatus === "pending" && "Sẵn sàng thanh toán"}
            {paymentStatus === "processing" && "Đang xử lý thanh toán"}
            {paymentStatus === "success" && "Thanh toán thành công"}
            {paymentStatus === "failed" && "Thanh toán thất bại"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paymentStatus === "pending" && (
            <div className="space-y-4">
              <p className="text-gray-600">{methodConfig.description}</p>
              <Button
                onClick={handleStartPayment}
                disabled={createPayment.isPending}
                className="w-full"
                size="lg"
              >
                {createPayment.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang khởi tạo...
                  </div>
                ) : (
                  <>
                    Tiến hành thanh toán
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}

          {paymentStatus === "processing" && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600 mb-2">
                  Đang chờ xác nhận thanh toán...
                </p>
                <p className="text-sm text-gray-500">
                  Thời gian còn lại: {formatTime(countdown)}
                </p>
              </div>

              {paymentUrl && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700 mb-2">
                    Nếu trang thanh toán không tự động mở, vui lòng click vào
                    link bên dưới:
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={paymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Mở trang thanh toán
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </div>
              )}
            </div>
          )}

          {paymentStatus === "success" && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <div>
                <p className="text-green-600 font-medium mb-2">
                  Thanh toán thành công!
                </p>
                <p className="text-gray-600 text-sm">
                  Đơn hàng của bạn đã được thanh toán và sẽ được xử lý sớm nhất.
                </p>
              </div>
              <Button asChild>
                <Link href={`/checkout/success?order=${orderNumber}`}>
                  Xem chi tiết đơn hàng
                </Link>
              </Button>
            </div>
          )}

          {paymentStatus === "failed" && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <div>
                <p className="text-red-600 font-medium mb-2">
                  Thanh toán thất bại
                </p>
                <p className="text-gray-600 text-sm">
                  Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại
                  hoặc chọn phương thức thanh toán khác.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => setPaymentStatus("pending")}
                  variant="outline"
                >
                  Thử lại
                </Button>
                <Button asChild>
                  <Link href={`/orders`}>Quay lại đơn hàng</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* COD Instructions */}
      {paymentMethod === "cod" && paymentStatus === "processing" && (
        <Card>
          <CardHeader>
            <CardTitle>Hướng dẫn thanh toán COD</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <p className="text-gray-600">
                Bạn sẽ thanh toán bằng tiền mặt khi nhận hàng.
              </p>
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <ul className="space-y-1 text-green-700">
                  <li>✓ Kiểm tra hàng trước khi thanh toán</li>
                  <li>✓ Chuẩn bị đủ tiền mặt</li>
                  <li>✓ Nhận hóa đơn từ shipper</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Back Button */}
      <div className="text-center">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/orders" className="flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách đơn hàng
          </Link>
        </Button>
      </div>
    </div>
  );
}
