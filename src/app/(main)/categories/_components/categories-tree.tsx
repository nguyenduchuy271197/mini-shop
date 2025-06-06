"use client";

import Link from "next/link";
import { useCategoryTree } from "@/hooks/categories";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Folder,
  FolderOpen,
  Package,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

export default function CategoriesTree() {
  const { data, isLoading, error } = useCategoryTree();

  if (isLoading) {
    return <CategoriesTreeLoading />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Đã xảy ra lỗi khi tải cây danh mục. Vui lòng thử lại sau.
        </AlertDescription>
      </Alert>
    );
  }

  if (!data?.success) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {data?.error || "Không thể tải cây danh mục"}
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
          Cây danh mục sẽ được cập nhật sớm
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <CategoryTreeNode key={category.id} category={category} level={0} />
      ))}
    </div>
  );
}

interface CategoryTreeNodeProps {
  category: {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    product_count?: number;
    children?: CategoryTreeNodeProps["category"][];
  };
  level: number;
}

function CategoryTreeNode({ category, level }: CategoryTreeNodeProps) {
  const hasChildren = category.children && category.children.length > 0;
  const indent = level * 24; // 24px per level

  return (
    <div>
      <Card className="group hover:shadow-md transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-3"
              style={{ marginLeft: `${indent}px` }}
            >
              {/* Category Icon */}
              {hasChildren ? (
                <FolderOpen className="h-5 w-5 text-blue-600" />
              ) : (
                <Folder className="h-5 w-5 text-gray-600" />
              )}

              {/* Category Info */}
              <div className="flex-1">
                <Link
                  href={`/products?category=${category.id}`}
                  className="group-hover:text-primary transition-colors"
                >
                  <h3 className="font-medium text-lg">{category.name}</h3>
                </Link>

                {category.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                    {category.description}
                  </p>
                )}

                <div className="flex items-center gap-4 mt-2">
                  {/* Product Count */}
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Package className="h-4 w-4" />
                    <span>
                      {category.product_count !== undefined
                        ? `${category.product_count} sản phẩm`
                        : "Đang cập nhật"}
                    </span>
                  </div>

                  {/* Category Slug */}
                  <div className="text-xs text-muted-foreground">
                    /{category.slug}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {category.product_count !== undefined &&
                category.product_count > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    Có sẵn
                  </Badge>
                )}

              <Link
                href={`/products?category=${category.id}`}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Children Categories */}
      {hasChildren && (
        <div className="ml-6 mt-2 space-y-2">
          {category.children?.map((child) => (
            <CategoryTreeNode
              key={child.id}
              category={child}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoriesTreeLoading() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
                <div className="space-y-2">
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                  <div className="flex items-center gap-4">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-5 w-12 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
