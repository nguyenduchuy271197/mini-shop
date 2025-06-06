import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import AddToCartButton from "@/components/cart/add-to-cart-button";
import type { Product, Category } from "@/types/custom.types";

type ProductWithCategory = Product & {
  category?: Pick<Category, "id" | "name" | "slug"> | null;
};

interface ProductCardProps {
  product: ProductWithCategory;
}

export default function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const isOutOfStock = product.stock_quantity <= 0;

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden">
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden">
          {/* Product Image */}
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <Package className="h-16 w-16 text-gray-400" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.is_featured && (
              <Badge variant="secondary" className="text-xs">
                Nổi bật
              </Badge>
            )}
            {isOutOfStock && (
              <Badge variant="destructive" className="text-xs">
                Hết hàng
              </Badge>
            )}
          </div>

          {/* Category Badge */}
          {product.category && (
            <div className="absolute top-2 right-2">
              <Badge
                variant="outline"
                className="text-xs bg-white/80 backdrop-blur-sm"
              >
                {product.category.name}
              </Badge>
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Product Name */}
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-medium text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>

          {/* Brand */}
          {product.brand && (
            <p className="text-xs text-muted-foreground">{product.brand}</p>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-primary">
              {formatPrice(product.price)}
            </span>
            {product.compare_price && product.compare_price > product.price && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.compare_price)}
              </span>
            )}
          </div>

          {/* Rating - TODO: Implement when review aggregation is available */}

          {/* Stock Status */}
          <div className="text-xs">
            {isOutOfStock ? (
              <span className="text-destructive">Hết hàng</span>
            ) : product.stock_quantity <= 10 ? (
              <span className="text-orange-600">
                Chỉ còn {product.stock_quantity} sản phẩm
              </span>
            ) : (
              <span className="text-green-600">Còn hàng</span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <div className="mt-3">
          <AddToCartButton
            productId={product.id}
            maxQuantity={product.stock_quantity}
            disabled={isOutOfStock}
            variant="outline"
            size="sm"
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
}
