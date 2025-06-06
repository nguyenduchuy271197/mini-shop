"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUpdateCartItem, useRemoveFromCart } from "@/hooks/cart";
import { useState } from "react";
import { CartItem, Product } from "@/types/custom.types";

// Extended cart item type with product info (matching the hook's type)
type CartItemWithProduct = CartItem & {
  product?: Pick<
    Product,
    "id" | "name" | "slug" | "price" | "images" | "stock_quantity" | "is_active"
  > | null;
};

interface CartItemCardProps {
  item: CartItemWithProduct;
}

export default function CartItemCard({ item }: CartItemCardProps) {
  const [quantity, setQuantity] = useState(item.quantity);
  const updateCartItem = useUpdateCartItem();
  const removeFromCart = useRemoveFromCart();

  // Return null if product doesn't exist
  if (!item.product) {
    return null;
  }

  const imageUrl = item.product.images?.[0] || "/placeholder-product.jpg";
  const totalPrice = item.product.price * quantity;

  const handleQuantityChange = (newQuantity: number) => {
    if (
      !item.product ||
      newQuantity < 1 ||
      newQuantity > item.product.stock_quantity
    )
      return;

    setQuantity(newQuantity);
    updateCartItem.mutate({
      cartItemId: item.id,
      quantity: newQuantity,
    });
  };

  const handleRemove = () => {
    removeFromCart.mutate({ cartItemId: item.id });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-start space-x-4">
        {/* Product Image */}
        <Link href={`/products/${item.product.slug}`}>
          <div className="relative w-20 h-20 flex-shrink-0">
            <Image
              src={imageUrl}
              alt={item.product.name}
              fill
              className="object-cover rounded-md"
            />
          </div>
        </Link>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <Link
            href={`/products/${item.product.slug}`}
            className="font-medium text-gray-900 hover:text-primary transition-colors"
          >
            <h3 className="text-sm font-medium line-clamp-2">
              {item.product.name}
            </h3>
          </Link>

          <p className="text-sm text-gray-600 mt-1">
            {formatPrice(item.product.price)} / sản phẩm
          </p>

          {/* Stock status */}
          {item.product.stock_quantity < 10 && (
            <p className="text-xs text-orange-600 mt-1">
              Chỉ còn {item.product.stock_quantity} sản phẩm
            </p>
          )}

          {/* Mobile Actions */}
          <div className="flex items-center justify-between mt-3 sm:hidden">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1 || updateCartItem.isPending}
                className="h-8 w-8 p-0"
              >
                <Minus className="h-3 w-3" />
              </Button>

              <Input
                type="number"
                min="1"
                max={item.product.stock_quantity}
                value={quantity}
                onChange={(e) => {
                  const newQuantity = parseInt(e.target.value) || 1;
                  handleQuantityChange(newQuantity);
                }}
                className="w-16 h-8 text-center"
                disabled={updateCartItem.isPending}
              />

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={
                  quantity >= item.product.stock_quantity ||
                  updateCartItem.isPending
                }
                className="h-8 w-8 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            <div className="text-right">
              <p className="font-semibold text-sm">{formatPrice(totalPrice)}</p>
            </div>
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center space-x-4">
          {/* Quantity Controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1 || updateCartItem.isPending}
              className="h-8 w-8 p-0"
            >
              <Minus className="h-3 w-3" />
            </Button>

            <Input
              type="number"
              min="1"
              max={item.product.stock_quantity}
              value={quantity}
              onChange={(e) => {
                const newQuantity = parseInt(e.target.value) || 1;
                handleQuantityChange(newQuantity);
              }}
              className="w-16 h-8 text-center"
              disabled={updateCartItem.isPending}
            />

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={
                quantity >= item.product.stock_quantity ||
                updateCartItem.isPending
              }
              className="h-8 w-8 p-0"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Price */}
          <div className="text-right min-w-[100px]">
            <p className="font-semibold">{formatPrice(totalPrice)}</p>
          </div>

          {/* Remove Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={removeFromCart.isPending}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile Remove Button */}
      <div className="flex justify-end mt-3 sm:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          disabled={removeFromCart.isPending}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Xóa
        </Button>
      </div>
    </div>
  );
}
