"use client";

import Link from "next/link";
import { useCategories } from "@/hooks/categories";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Folder, Package, AlertCircle } from "lucide-react";

export default function CategoriesGrid() {
  const { data, isLoading, error } = useCategories({
    includeProductCount: true,
  });

  if (isLoading) {
    return <CategoriesGridLoading />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Đã xảy ra lỗi khi tải danh mục. Vui lòng thử lại sau.
        </AlertDescription>
      </Alert>
    );
  }

  if (!data?.success) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {data?.error || "Không thể tải danh sách danh mục"}
        </AlertDescription>
      </Alert>
    );
  }

  const { categories } = data;

  if (categories.length === 0) {
    return (
      <div className="text-center py-16">
        <Folder className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Chưa có danh mục nào
        </h3>
        <p className="text-muted-foreground">
          Danh mục sản phẩm sẽ được cập nhật sớm
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category) => (
        <Link key={category.id} href={`/products?category=${category.id}`}>
          <Card className="group hover:shadow-lg transition-all duration-200 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg group-hover:text-primary transition-colors">
                <Folder className="h-5 w-5" />
                {category.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Description */}
                {category.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {category.description}
                  </p>
                )}

                {/* Product Count */}
                <div className="flex items-center justify-between">
                  {category.product_count !== undefined &&
                    category.product_count > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        Có sẵn
                      </Badge>
                    )}
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function CategoriesGridLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <Card key={i} className="h-full">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="flex items-center justify-between">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-5 w-12 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
