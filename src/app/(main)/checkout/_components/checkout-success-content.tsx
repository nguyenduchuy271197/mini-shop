"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Package, Eye, Home, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";

interface CheckoutSuccessContentProps {
  orderNumber: string;
}

export default function CheckoutSuccessContent({
  orderNumber,
}: CheckoutSuccessContentProps) {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto redirect to orders page after countdown
          window.location.href = "/orders";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-center space-y-8">
      {/* Success Icon */}
      <div className="flex justify-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
      </div>

      {/* Success Message */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Đặt hàng thành công!
        </h1>
        <p className="text-lg text-gray-600">
          Cảm ơn bạn đã mua sắm tại Mini Shop
        </p>
      </div>

      {/* Order Information */}
      <Card className="text-left">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Mã đơn hàng:</span>
              <Badge variant="outline" className="font-mono">
                #{orderNumber}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Trạng thái:</span>
              <Badge className="bg-yellow-100 text-yellow-800">Chờ xử lý</Badge>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-3">
                <Package className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 mb-1">
                    Đơn hàng đang được xử lý
                  </p>
                  <p className="text-blue-700">
                    Chúng tôi sẽ xác nhận đơn hàng và gửi thông tin vận chuyển
                    qua email trong vòng 24 giờ.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Bước tiếp theo:</h3>
          <div className="space-y-3 text-sm text-left">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs">
                1
              </div>
              <span>Chúng tôi sẽ xác nhận đơn hàng qua email</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-xs">
                2
              </div>
              <span>Đóng gói và chuẩn bị hàng hóa</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-xs">
                3
              </div>
              <span>Giao hàng đến địa chỉ của bạn</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild size="lg">
          <Link href="/orders" className="flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            Xem đơn hàng
          </Link>
        </Button>

        <Button variant="outline" asChild size="lg">
          <Link href="/products" className="flex items-center">
            <ShoppingBag className="w-5 h-5 mr-2" />
            Tiếp tục mua sắm
          </Link>
        </Button>

        <Button variant="ghost" asChild size="lg">
          <Link href="/" className="flex items-center">
            <Home className="w-5 h-5 mr-2" />
            Về trang chủ
          </Link>
        </Button>
      </div>

      {/* Auto Redirect Notice */}
      <div className="text-sm text-gray-500">
        Tự động chuyển đến trang đơn hàng sau {countdown} giây...
      </div>

      {/* Contact Information */}
      <Card className="bg-gray-50">
        <CardContent className="p-6">
          <h4 className="font-medium text-gray-900 mb-3">Cần hỗ trợ?</h4>
          <div className="text-sm text-gray-600 space-y-2">
            <p>📞 Hotline: 1900-1234 (8:00 - 22:00)</p>
            <p>📧 Email: support@minishop.vn</p>
            <p>💬 Chat trực tuyến trên website</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
