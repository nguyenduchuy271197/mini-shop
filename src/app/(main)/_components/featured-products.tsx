"use client";

import Link from "next/link";
import { useFeaturedProducts } from "@/hooks/products";
import ProductCard from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Star, ChevronRight, AlertCircle } from "lucide-react";

export default function FeaturedProducts() {
  const { data, isLoading, error } = useFeaturedProducts({ limit: 8 });

  if (error) {
    return (
      <div className="container mx-auto px-4">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Không thể tải sản phẩm nổi bật. Vui lòng thử lại sau.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Star className="h-4 w-4 fill-current" />
            Sản phẩm nổi bật
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Được yêu thích nhất
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Khám phá những sản phẩm được khách hàng tin tưởng và đánh giá cao
            nhất
          </p>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <FeaturedProductsLoading />
        ) : data?.success && data.products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {data.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center">
              <Button size="lg" variant="outline" className="px-8 py-3" asChild>
                <Link href="/products?featured=true">
                  Xem tất cả sản phẩm nổi bật
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có sản phẩm nổi bật
            </h3>
            <p className="text-gray-600 mb-6">
              Hãy quay lại sau để xem những sản phẩm tuyệt vời nhất của chúng
              tôi
            </p>
            <Button asChild>
              <Link href="/products">Khám phá tất cả sản phẩm</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function FeaturedProductsLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}
