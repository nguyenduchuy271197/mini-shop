"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart, useCartTotal } from "@/hooks/cart";
import { useCheckoutContext } from "./checkout-context";
import Image from "next/image";
import { Package } from "lucide-react";

export default function CheckoutSummary() {
  const { selectedShippingMethod } = useCheckoutContext();
  const { data: cartData, isLoading: cartLoading } = useCart();
  const { data: cartTotalData, isLoading: totalLoading } = useCartTotal({
    shippingMethod: selectedShippingMethod,
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (cartLoading || totalLoading) {
    return (
      <Card className="sticky top-4">
        <CardHeader>
          <CardTitle>Tóm tắt đơn hàng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex space-x-3 animate-pulse">
              <div className="w-16 h-16 bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const cartItems = cartData?.cartItems || [];
  const cartBreakdown = cartTotalData?.breakdown;

  if (cartItems.length === 0) {
    return (
      <Card className="sticky top-4">
        <CardContent className="text-center py-8">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Giỏ hàng của bạn đang trống</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>Tóm tắt đơn hàng</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cart Items */}
        <div className="space-y-4">
          {cartItems.map((item) => {
            if (!item.product) return null;

            const imageUrl =
              item.product.images?.[0] || "/placeholder-product.jpg";
            const totalPrice = item.product.price * item.quantity;

            return (
              <div key={item.id} className="flex space-x-3">
                <div className="relative w-16 h-16 bg-gray-100 rounded overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-medium text-sm line-clamp-2">
                    {item.product.name}
                  </h4>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Số lượng: {item.quantity}
                    </span>
                    <span className="font-medium">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Price Breakdown */}
        {cartBreakdown && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Tạm tính</span>
              <span>{formatPrice(cartBreakdown.subtotal)}</span>
            </div>

            {cartBreakdown.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Giảm giá</span>
                <span>-{formatPrice(cartBreakdown.discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span>Phí vận chuyển</span>
              <span
                className={
                  cartBreakdown.shippingCost === 0 ? "text-green-600" : ""
                }
              >
                {cartBreakdown.shippingCost === 0
                  ? "Miễn phí"
                  : formatPrice(cartBreakdown.shippingCost)}
              </span>
            </div>

            <Separator />

            <div className="flex justify-between font-semibold text-lg">
              <span>Tổng cộng</span>
              <span className="text-primary">
                {formatPrice(cartBreakdown.total)}
              </span>
            </div>
          </div>
        )}

        {/* Security Note */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-600 space-y-1">
            <p>✓ Thanh toán an toàn và bảo mật</p>
            <p>✓ Chính sách đổi trả trong 7 ngày</p>
            <p>✓ Hỗ trợ khách hàng 24/7</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
