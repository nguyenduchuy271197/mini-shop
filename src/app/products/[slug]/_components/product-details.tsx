import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Package, Truck, Shield, RotateCcw } from "lucide-react";
import AddToCartButton from "@/components/cart/add-to-cart-button";
import WishlistButton from "@/components/ui/wishlist-button";
import type { Product, Category } from "@/types/custom.types";

type ProductWithCategory = Product & {
  category?: Pick<Category, "id" | "name" | "slug"> | null;
};

interface ProductDetailsProps {
  product: ProductWithCategory;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 10;

  const discountPercentage =
    product.compare_price && product.compare_price > product.price
      ? Math.round(
          ((product.compare_price - product.price) / product.compare_price) *
            100
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Category */}
      {product.category && (
        <div className="flex items-center text-sm text-muted-foreground">
          <Link href="/products" className="hover:text-primary">
            Sản phẩm
          </Link>
          <span className="mx-2">/</span>
          <Link
            href={`/products?category=${product.category.id}`}
            className="hover:text-primary"
          >
            {product.category.name}
          </Link>
        </div>
      )}

      {/* Product Name */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {product.name}
        </h1>
        {product.brand && (
          <p className="text-lg text-muted-foreground">
            Thương hiệu: <span className="font-medium">{product.brand}</span>
          </p>
        )}
      </div>

      {/* Rating - TODO: Implement when review aggregation is available */}

      {/* Price */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-primary">
            {formatPrice(product.price)}
          </span>
          {product.compare_price && product.compare_price > product.price && (
            <>
              <span className="text-xl text-muted-foreground line-through">
                {formatPrice(product.compare_price)}
              </span>
              <Badge variant="destructive" className="text-sm">
                -{discountPercentage}%
              </Badge>
            </>
          )}
        </div>
        {product.compare_price && product.compare_price > product.price && (
          <p className="text-sm text-green-600">
            Tiết kiệm {formatPrice(product.compare_price - product.price)}
          </p>
        )}
      </div>

      <Separator />

      {/* Stock Status */}
      <div className="space-y-2">
        <h3 className="font-medium">Tình trạng kho:</h3>
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          {isOutOfStock ? (
            <span className="text-destructive font-medium">Hết hàng</span>
          ) : isLowStock ? (
            <span className="text-orange-600 font-medium">
              Chỉ còn {product.stock_quantity} sản phẩm
            </span>
          ) : (
            <span className="text-green-600 font-medium">
              Còn hàng ({product.stock_quantity} sản phẩm)
            </span>
          )}
        </div>
      </div>

      {/* Add to Cart Section */}
      <div className="space-y-4">
        <AddToCartButton
          productId={product.id}
          maxQuantity={product.stock_quantity}
          disabled={isOutOfStock}
          size="lg"
          showQuantitySelector={true}
          className="w-full"
        />

        {/* Wishlist Button */}
        <div className="flex justify-center">
          <WishlistButton
            productId={product.id}
            size="lg"
            variant="outline"
            showText={true}
            className="min-w-[200px]"
          />
        </div>
      </div>

      {/* Tags */}
      {product.tags && product.tags.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Tags:</h3>
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        {product.is_featured && (
          <Badge variant="secondary">Sản phẩm nổi bật</Badge>
        )}
        {!isOutOfStock && <Badge variant="outline">Có sẵn</Badge>}
      </div>

      <Separator />

      {/* Features/Benefits */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Chính sách bán hàng</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Truck className="h-4 w-4 text-green-600" />
              <span>Miễn phí vận chuyển cho đơn hàng trên 500.000₫</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <RotateCcw className="h-4 w-4 text-blue-600" />
              <span>Đổi trả trong vòng 30 ngày</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Shield className="h-4 w-4 text-purple-600" />
              <span>Bảo hành chính hãng</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Thông tin cơ bản</h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-muted-foreground">SKU:</dt>
              <dd className="text-sm font-medium">{product.sku || "N/A"}</dd>
            </div>
            {product.weight && (
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Trọng lượng:</dt>
                <dd className="text-sm font-medium">{product.weight} kg</dd>
              </div>
            )}
            {product.dimensions && (
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Kích thước:</dt>
                <dd className="text-sm font-medium">
                  {typeof product.dimensions === "string"
                    ? product.dimensions
                    : typeof product.dimensions === "object" &&
                      product.dimensions !== null
                    ? `${
                        (
                          product.dimensions as {
                            width?: number;
                            height?: number;
                            length?: number;
                          }
                        ).width || 0
                      } x ${
                        (
                          product.dimensions as {
                            width?: number;
                            height?: number;
                            length?: number;
                          }
                        ).height || 0
                      } x ${
                        (
                          product.dimensions as {
                            width?: number;
                            height?: number;
                            length?: number;
                          }
                        ).length || 0
                      } cm`
                    : "N/A"}
                </dd>
              </div>
            )}
            {product.category && (
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Danh mục:</dt>
                <dd className="text-sm font-medium">
                  <Link
                    href={`/products?category=${product.category.id}`}
                    className="text-primary hover:underline"
                  >
                    {product.category.name}
                  </Link>
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
