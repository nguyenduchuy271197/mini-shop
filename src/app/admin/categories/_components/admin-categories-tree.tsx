"use client";

import { useCategoryTree } from "@/hooks/categories";
import { Category } from "@/types/custom.types";
import { Badge } from "@/components/ui/badge";
import { Folder } from "lucide-react";

// Extended category type
type CategoryWithCount = Category & {
  product_count?: number;
};

interface CategoryListItemProps {
  category: CategoryWithCount;
}

function CategoryListItem({ category }: CategoryListItemProps) {
  return (
    <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
      <Folder className="h-5 w-5 text-blue-500" />

      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{category.name}</span>
          <Badge
            variant={category.is_active ? "default" : "secondary"}
            className="text-xs"
          >
            {category.is_active ? "Hoạt động" : "Tạm dừng"}
          </Badge>
        </div>
        {category.description && (
          <p className="text-xs text-gray-500 mt-1 truncate">
            {category.description}
          </p>
        )}
        <p className="text-xs text-gray-400 mt-1">Slug: {category.slug}</p>
      </div>
    </div>
  );
}

export function AdminCategoriesTree() {
  const { data: categoryTreeResult, isLoading, error } = useCategoryTree();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded flex-1 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center text-red-600">
          <p className="font-medium">Lỗi tải danh sách danh mục</p>
          <p className="text-sm mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  if (
    !categoryTreeResult?.success ||
    !categoryTreeResult.categories ||
    categoryTreeResult.categories.length === 0
  ) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <Folder className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="font-medium">Chưa có danh mục nào</p>
          <p className="text-sm mt-1">Tạo danh mục đầu tiên để bắt đầu</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium">Danh sách danh mục</h3>
        <p className="text-sm text-gray-600 mt-1">
          Tất cả danh mục sản phẩm trong hệ thống
        </p>
      </div>

      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {categoryTreeResult.categories.map((category) => (
          <CategoryListItem key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}
