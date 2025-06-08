"use client";

import Link from "next/link";
import { useCategoryTree } from "@/hooks/categories";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Folder, Package, AlertCircle, ChevronRight } from "lucide-react";

export default function CategoriesList() {
  const { data, isLoading, error } = useCategoryTree();

  if (isLoading) {
    return <CategoriesListLoading />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Đã xảy ra lỗi khi tải danh sách danh mục. Vui lòng thử lại sau.
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
          Danh sách danh mục sẽ được cập nhật sớm
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
}

interface CategoryCardProps {
  category: {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    product_count?: number;
  };
}

function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer">
      <Link href={`/products?category=${category.id}`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1">
              {/* Category Icon */}
              <Folder className="h-6 w-6 text-primary flex-shrink-0" />

              {/* Category Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors truncate">
                  {category.name}
                </h3>

                {category.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {category.description}
                  </p>
                )}

                <div className="flex items-center justify-between mt-3">
                  {/* Product Count */}
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Package className="h-4 w-4" />
                    <span>
                      {category.product_count !== undefined
                        ? `${category.product_count} sản phẩm`
                        : "Đang cập nhật"}
                    </span>
                  </div>

                  {/* Status Badge */}
                  {category.product_count !== undefined &&
                    category.product_count > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        Có sẵn
                      </Badge>
                    )}
                </div>

                {/* Category Slug */}
                <div className="text-xs text-muted-foreground mt-2">
                  /{category.slug}
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex items-center ml-2">
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}

function CategoriesListLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="h-6 w-6 bg-gray-200 rounded animate-pulse flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                  <div className="flex items-center justify-between mt-3">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="h-5 w-12 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse ml-2" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
