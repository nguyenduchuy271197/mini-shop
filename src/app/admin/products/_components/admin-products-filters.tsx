"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCategories } from "@/hooks/categories";
import { Search, X, Filter } from "lucide-react";

interface ProductsFilters {
  searchTerm?: string;
  categoryId?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  stockStatus?: "in_stock" | "low_stock" | "out_of_stock";
}

interface AdminProductsFiltersProps {
  filters: ProductsFilters;
  onFiltersChange: (filters: ProductsFilters) => void;
}

export function AdminProductsFilters({
  filters,
  onFiltersChange,
}: AdminProductsFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: categories } = useCategories();

  const handleSearchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      searchTerm: value || undefined,
    });
  };

  const handleCategoryChange = (value: string) => {
    onFiltersChange({
      ...filters,
      categoryId: value === "all" ? undefined : parseInt(value),
    });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      isActive: value === "all" ? undefined : value === "active",
    });
  };

  const handleFeaturedChange = (value: string) => {
    onFiltersChange({
      ...filters,
      isFeatured: value === "all" ? undefined : value === "featured",
    });
  };

  const handleStockStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      stockStatus:
        value === "all"
          ? undefined
          : (value as "in_stock" | "low_stock" | "out_of_stock"),
    });
  };

  const handlePriceRangeChange = (min: string, max: string) => {
    onFiltersChange({
      ...filters,
      minPrice: min ? parseFloat(min) : undefined,
      maxPrice: max ? parseFloat(max) : undefined,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-medium">Bộ lọc sản phẩm</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary">{activeFiltersCount} bộ lọc</Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {activeFiltersCount > 0 && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Xóa bộ lọc
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Thu gọn" : "Mở rộng"}
          </Button>
        </div>
      </div>

      {/* Basic Filters - Always Visible */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            value={filters.searchTerm || ""}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category Filter */}
        <Select
          value={filters.categoryId?.toString() || "all"}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Lọc theo danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            {categories?.success &&
              categories.categories?.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={
            filters.isActive === undefined
              ? "all"
              : filters.isActive
              ? "active"
              : "inactive"
          }
          onValueChange={handleStatusChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="active">Đang bán</SelectItem>
            <SelectItem value="inactive">Tạm dừng</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Advanced Filters - Expandable */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          {/* Featured Filter */}
          <Select
            value={
              filters.isFeatured === undefined
                ? "all"
                : filters.isFeatured
                ? "featured"
                : "not_featured"
            }
            onValueChange={handleFeaturedChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sản phẩm nổi bật" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="featured">Nổi bật</SelectItem>
              <SelectItem value="not_featured">Không nổi bật</SelectItem>
            </SelectContent>
          </Select>

          {/* Stock Status Filter */}
          <Select
            value={filters.stockStatus || "all"}
            onValueChange={handleStockStatusChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tình trạng kho" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="in_stock">Còn hàng</SelectItem>
              <SelectItem value="low_stock">Sắp hết</SelectItem>
              <SelectItem value="out_of_stock">Hết hàng</SelectItem>
            </SelectContent>
          </Select>

          {/* Price Range */}
          <div className="flex space-x-2">
            <Input
              type="number"
              placeholder="Giá từ"
              value={filters.minPrice || ""}
              onChange={(e) =>
                handlePriceRangeChange(
                  e.target.value,
                  filters.maxPrice?.toString() || ""
                )
              }
            />
            <Input
              type="number"
              placeholder="Giá đến"
              value={filters.maxPrice || ""}
              onChange={(e) =>
                handlePriceRangeChange(
                  filters.minPrice?.toString() || "",
                  e.target.value
                )
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
