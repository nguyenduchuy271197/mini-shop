"use client";

import { useState } from "react";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAddToCart } from "@/hooks/cart";

interface AddToCartButtonProps {
  productId: number;
  maxQuantity: number;
  disabled?: boolean;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  showQuantitySelector?: boolean;
  className?: string;
}

export default function AddToCartButton({
  productId,
  maxQuantity,
  disabled = false,
  variant = "default",
  size = "default",
  showQuantitySelector = false,
  className = "",
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const addToCart = useAddToCart();

  const handleAddToCart = () => {
    addToCart.mutate({
      productId,
      quantity,
    });
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  const isOutOfStock = maxQuantity === 0;
  const isButtonDisabled = disabled || isOutOfStock || addToCart.isPending;

  if (isOutOfStock) {
    return (
      <Button disabled variant="outline" size={size} className={className}>
        Hết hàng
      </Button>
    );
  }

  return (
    <div className="space-y-3">
      {showQuantitySelector && (
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium">Số lượng:</span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              className="h-8 w-8 p-0"
            >
              <Minus className="h-3 w-3" />
            </Button>

            <Input
              type="number"
              min="1"
              max={maxQuantity}
              value={quantity}
              onChange={(e) => {
                const newQuantity = parseInt(e.target.value) || 1;
                handleQuantityChange(newQuantity);
              }}
              className="w-16 h-8 text-center"
            />

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= maxQuantity}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {maxQuantity < 10 && (
            <span className="text-xs text-orange-600">
              Chỉ còn {maxQuantity} sản phẩm
            </span>
          )}
        </div>
      )}

      <Button
        onClick={handleAddToCart}
        disabled={isButtonDisabled}
        variant={variant}
        size={size}
        className={`${className} ${size === "lg" ? "w-full" : ""}`}
      >
        {addToCart.isPending ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Đang thêm...
          </div>
        ) : (
          <div className="flex items-center">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Thêm vào giỏ hàng
            {showQuantitySelector && quantity > 1 && (
              <span className="ml-1">({quantity})</span>
            )}
          </div>
        )}
      </Button>
    </div>
  );
}
