"use client";

import { useCart } from "@/hooks/cart";
import CartEmpty from "./cart-empty";
import CartItemCard from "./cart-item-card";

export default function CartItems() {
  const { data: cartData, isLoading, error } = useCart();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="h-20 w-20 bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
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
