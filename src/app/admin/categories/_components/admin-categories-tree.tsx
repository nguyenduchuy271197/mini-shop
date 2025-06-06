"use client";

import { useCategoryTree } from "@/hooks/categories";
import { Category } from "@/types/custom.types";

// Extended category type for tree structure
type CategoryWithChildren = Category & {
  children?: CategoryWithChildren[];
};
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Folder, FolderOpen } from "lucide-react";
import { useState } from "react";

interface CategoryTreeItemProps {
  category: CategoryWithChildren;
  childCategories?: CategoryWithChildren[];
  level?: number;
}

function CategoryTreeItem({
  category,
  childCategories = [],
  level = 0,
}: CategoryTreeItemProps) {
  const [isOpen, setIsOpen] = useState(level === 0);
  const hasChildren = childCategories.length > 0;

  return (
    <div className="space-y-1">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className={`w-full justify-start p-2 h-auto ${
              level > 0 ? "ml-4" : ""
            }`}
          >
            <div className="flex items-center space-x-2 w-full">
              {hasChildren ? (
                isOpen ? (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )
              ) : (
                <div className="w-4" />
              )}

              {hasChildren ? (
                <FolderOpen className="h-4 w-4 text-blue-500" />
              ) : (
                <Folder className="h-4 w-4 text-gray-500" />
              )}

              <div className="flex-1 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{category.name}</span>
                  <div className="flex items-center space-x-1">
                    <Badge
                      variant={category.is_active ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {category.is_active ? "Hoạt động" : "Tạm dừng"}
                    </Badge>
                  </div>
                </div>
                {category.description && (
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {category.description}
                  </p>
                )}
              </div>
            </div>
          </Button>
        </CollapsibleTrigger>

        {hasChildren && (
          <CollapsibleContent className="space-y-1">
            {childCategories.map((child) => (
              <CategoryTreeItem
                key={child.id}
                category={child}
                childCategories={child.children || []}
                level={level + 1}
              />
            ))}
          </CollapsibleContent>
        )}
      </Collapsible>
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
          <p className="font-medium">Lỗi tải cây danh mục</p>
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
        <h3 className="text-lg font-medium">Cây danh mục</h3>
        <p className="text-sm text-gray-600 mt-1">
          Cấu trúc phân cấp danh mục sản phẩm
        </p>
      </div>

      <div className="p-4 space-y-1 max-h-96 overflow-y-auto">
        {categoryTreeResult.categories.map((category) => (
          <CategoryTreeItem
            key={category.id}
            category={category}
            childCategories={category.children || []}
          />
        ))}
      </div>
    </div>
  );
}
