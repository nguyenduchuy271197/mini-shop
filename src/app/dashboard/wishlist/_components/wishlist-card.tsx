"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRemoveFromWishlist, useMoveToCart } from "@/hooks/wishlists";
import type { Product } from "@/types/custom.types";

interface WishlistCardProps {
  item: {
    id: number;
    product_id: number;
    created_at: string;
    products: Pick<
      Product,
      | "id"
      | "name"
      | "slug"
      | "price"
      | "compare_price"
      | "images"
      | "is_active"
      | "stock_quantity"
    > | null;
  };
}

export default function WishlistCard({ item }: WishlistCardProps) {
  const removeFromWishlist = useRemoveFromWishlist();
  const moveToCart = useMoveToCart();

  const product = item.products;

  // Handle case where product is null (deleted product)
  if (!product) {
    return (
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Sản phẩm không còn tồn tại</p>
          <Button
            onClick={() =>
              removeFromWishlist.mutate({ productId: item.product_id })
            }
            size="sm"
            variant="outline"
          >
            Xóa khỏi danh sách
          </Button>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleRemoveFromWishlist = () => {
    removeFromWishlist.mutate({ productId: product.id });
  };

  const handleMoveToCart = () => {
    moveToCart.mutate({
      productId: product.id,
      quantity: 1,
    });
  };

  const productImage = product.images?.[0] || "/placeholder-product.jpg";

  return (
    <div className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
      {/* Product Image */}
      <div className="relative aspect-square mb-4 group">
        <Image
          src={productImage}
          alt={product.name}
          fill
          className="object-cover rounded-md"
        />

        {/* Quick View */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-md flex items-center justify-center">
          <Button
            asChild
            size="sm"
            variant="secondary"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Link href={`/products/${product.slug}`}>
              <Eye className="h-4 w-4 mr-1" />
              Xem chi tiết
            </Link>
          </Button>
        </div>

        {/* Stock Status Badge */}
        <div className="absolute top-2 left-2 space-y-1">
          {product.stock_quantity <= 0 && (
            <Badge variant="destructive" className="text-xs">
              Hết hàng
            </Badge>
          )}
          {!product.is_active && (
            <Badge variant="secondary" className="text-xs">
              Ngừng bán
            </Badge>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="space-y-3">
        <div>
          <h3 className="font-medium text-gray-900 line-clamp-2 mb-1">
            {product.name}
          </h3>
        </div>

        {/* Price */}
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-primary">
            {formatPrice(product.price)}
          </span>
          {product.compare_price && product.compare_price > product.price && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(product.compare_price)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="text-xs">
          {product.stock_quantity > 0 ? (
            <span className="text-green-600">
              Còn {product.stock_quantity} sản phẩm
            </span>
          ) : (
            <span className="text-red-600">Hết hàng</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Button
            onClick={handleMoveToCart}
            disabled={
              moveToCart.isPending ||
              product.stock_quantity === 0 ||
              !product.is_active
            }
            size="sm"
            className="flex-1"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            {moveToCart.isPending ? "Đang thêm..." : "Thêm vào giỏ"}
          </Button>

          <Button
            onClick={handleRemoveFromWishlist}
            disabled={removeFromWishlist.isPending}
            size="sm"
            variant="outline"
            className="px-3"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
