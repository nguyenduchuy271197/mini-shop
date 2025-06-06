"use client";

import { useRelatedProducts } from "@/hooks/products";
import ProductCard from "@/components/products/product-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, ChevronRight } from "lucide-react";
import Link from "next/link";

interface RelatedProductsProps {
  productId: number;
  categoryId?: number;
}

export default function RelatedProducts({
  productId,
  categoryId,
}: RelatedProductsProps) {
  const { data, isLoading, error } = useRelatedProducts({ productId });

  if (isLoading) {
    return <RelatedProductsLoading />;
  }

  if (error || !data?.success) {
    return null; // Don't show anything if there's an error
  }

  const { products } = data;

  if (products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Sản phẩm liên quan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Không tìm thấy sản phẩm liên quan</p>
            {categoryId && (
              <Link
                href={`/products?category=${categoryId}`}
                className="inline-flex items-center gap-1 text-primary hover:underline text-sm mt-2"
              >
                Xem thêm sản phẩm cùng danh mục
                <ChevronRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Package className="h-6 w-6" />
          Sản phẩm liên quan
        </h2>
        {categoryId && (
          <Link
            href={`/products?category=${categoryId}`}
            className="text-primary hover:underline text-sm flex items-center gap-1"
          >
            Xem tất cả
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {products.length > 4 && (
        <div className="text-center mt-6">
          <Link
            href={categoryId ? `/products?category=${categoryId}` : "/products"}
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            Xem thêm sản phẩm
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

function RelatedProductsLoading() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-20" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-square w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
