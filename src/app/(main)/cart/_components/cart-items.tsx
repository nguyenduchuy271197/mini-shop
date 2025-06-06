"use client";

import { useCart } from "@/hooks/cart";
import { useEffect, useState } from "react";
import CartEmpty from "./cart-empty";
import CartItemCard from "./cart-item-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CartItems() {
  const { data: cartData, isLoading, error } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering different content on server vs client
  if (!mounted) {
    return <CartItemsSkeleton />;
  }

  if (isLoading) {
    return <CartItemsSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Có lỗi xảy ra khi tải giỏ hàng</p>
      </div>
    );
  }

  const cartItems = cartData?.cartItems || [];

  if (cartItems.length === 0) {
    return <CartEmpty />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          Sản phẩm trong giỏ hàng ({cartItems.length})
        </h2>
      </div>

      {cartItems.map((item) => (
        <CartItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}

function CartItemsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-20 w-20 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
