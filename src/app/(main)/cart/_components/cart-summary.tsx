"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Tag, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCartTotal } from "@/hooks/cart";

export default function CartSummary() {
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | undefined>();
  const [mounted, setMounted] = useState(false);

  const {
    data: cartTotalData,
    isLoading,
    refetch,
  } = useCartTotal({
    couponCode: appliedCoupon,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setAppliedCoupon(couponCode.trim());
    await refetch();
  };

  const handleRemoveCoupon = async () => {
    setCouponCode("");
    setAppliedCoupon(undefined);
    await refetch();
  };

  // Prevent hydration mismatch by not rendering different content on server vs client
  if (!mounted) {
    return <CartSummarySkeleton />;
  }

  if (isLoading) {
    return <CartSummarySkeleton />;
  }

  const cartTotal = cartTotalData?.breakdown;

  if (!cartTotal) {
    return null;
  }

  return (
    <div className="border rounded-lg p-6 bg-white sticky top-8">
      <h2 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h2>

      {/* Coupon Code */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Mã giảm giá</label>
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Nhập mã giảm giá"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="pl-10"
              disabled={!!appliedCoupon}
            />
          </div>
          {appliedCoupon ? (
            <Button
              variant="outline"
              onClick={handleRemoveCoupon}
              className="px-4"
            >
              Hủy
            </Button>
          ) : (
            <Button
              onClick={handleApplyCoupon}
              disabled={!couponCode.trim()}
              className="px-4"
            >
              Áp dụng
            </Button>
          )}
        </div>

        {appliedCoupon && cartTotal.discountAmount > 0 && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-700">
              ✓ Đã áp dụng mã &ldquo;{appliedCoupon}&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span>Tạm tính</span>
          <span>{formatPrice(cartTotal.subtotal)}</span>
        </div>

        {cartTotal.discountAmount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Giảm giá</span>
            <span>-{formatPrice(cartTotal.discountAmount)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span>Phí vận chuyển</span>
          {cartTotal.subtotal >= 500000 ? (
            <span className="text-green-600">Miễn phí</span>
          ) : (
            <span className="text-gray-500">Tính khi thanh toán</span>
          )}
        </div>

        <div className="flex justify-between text-sm">
          <span>Thuế VAT</span>
          <span>Đã bao gồm</span>
        </div>

        <hr className="my-3" />

        <div className="flex justify-between font-semibold text-lg">
          <span>Tổng cộng</span>
          <span className="text-primary">{formatPrice(cartTotal.total)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Button asChild size="lg" className="w-full">
          <Link
            href="/checkout"
            className="inline-flex items-center justify-center"
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            Tiến hành thanh toán
          </Link>
        </Button>

        <Button variant="outline" asChild className="w-full">
          <Link href="/products">Tiếp tục mua sắm</Link>
        </Button>
      </div>

      {/* Additional Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-sm mb-2">Thông tin giao hàng</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Miễn phí vận chuyển cho đơn hàng từ 500.000₫</li>
          <li>• Giao hàng tiêu chuẩn: 30.000₫ (2-3 ngày)</li>
          <li>• Giao hàng nhanh: 50.000₫ (1-2 ngày)</li>
          <li>• Giao hàng trong ngày: 80.000₫ (cùng ngày)</li>
          <li>• Hỗ trợ đổi trả trong 7 ngày</li>
        </ul>
      </div>
    </div>
  );
}

function CartSummarySkeleton() {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <Skeleton className="h-6 w-1/2" />
      <div className="space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <hr />
        <div className="flex justify-between">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-5 w-1/4" />
        </div>
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
