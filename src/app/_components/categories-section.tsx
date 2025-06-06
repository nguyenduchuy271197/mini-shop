"use client";

import Link from "next/link";
import Image from "next/image";
import { useCategories } from "@/hooks/categories";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Grid3X3, ChevronRight, AlertCircle, Package } from "lucide-react";

export default function CategoriesSection() {
  const { data, isLoading, error } = useCategories();

  if (error) {
    return (
      <div className="container mx-auto px-4">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Không thể tải danh mục. Vui lòng thử lại sau.
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
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Grid3X3 className="h-4 w-4" />
            Danh mục sản phẩm
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Mua sắm theo danh mục
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tìm kiếm sản phẩm theo danh mục để dễ dàng tìm thấy điều bạn cần
          </p>
        </div>

        {/* Categories Grid */}
        {isLoading ? (
          <CategoriesLoading />
        ) : data?.success && data.categories.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
              {data.categories.slice(0, 8).map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center">
              <Button size="lg" variant="outline" className="px-8 py-3" asChild>
                <Link href="/categories">
                  Xem tất cả danh mục
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <Grid3X3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có danh mục nào
            </h3>
            <p className="text-gray-600 mb-6">
              Hãy quay lại sau để xem các danh mục sản phẩm
            </p>
            <Button asChild>
              <Link href="/products">Xem tất cả sản phẩm</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

interface CategoryCardProps {
  category: {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    image_url?: string | null;
    product_count?: number;
  };
}

function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/products?category=${category.id}`}>
      <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden h-full">
        <CardContent className="p-0">
          {/* Category Image */}
          <div className="relative aspect-square overflow-hidden bg-gray-100">
            {category.image_url ? (
              <Image
                src={category.image_url}
                alt={category.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <Package className="h-12 w-12 text-gray-400" />
              </div>
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-200"></div>

            {/* Category Name */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <h3 className="font-semibold text-lg mb-1 group-hover:scale-110 transition-transform duration-200">
                  {category.name}
                </h3>
                {category.product_count !== undefined && (
                  <p className="text-sm text-white/80">
                    {category.product_count} sản phẩm
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function CategoriesLoading() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-square w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}
