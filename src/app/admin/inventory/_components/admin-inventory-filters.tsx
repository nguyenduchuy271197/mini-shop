"use client";

import { useState } from "react";
import { useAdminCategories } from "@/hooks/admin/categories";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  X,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface InventoryFilters {
  searchTerm?: string;
  categoryId?: number;
  stockStatus?: "all" | "in_stock" | "low_stock" | "out_of_stock";
  sortBy?: "name" | "stock_quantity" | "updated_at";
  sortOrder?: "asc" | "desc";
}

interface AdminInventoryFiltersProps {
  filters: InventoryFilters;
  onFiltersChange: (filters: InventoryFilters) => void;
}

export function AdminInventoryFilters({
  filters,
  onFiltersChange,
}: AdminInventoryFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.searchTerm || "");

  // Categories for filter
  const { data: categoriesData } = useAdminCategories({
    isActive: true,
    limit: 100,
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({
      ...filters,
      searchTerm: searchInput.trim() || undefined,
    });
  };

  const handleFilterChange = (
    key: keyof InventoryFilters,
    value: string | number | undefined
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value === "all" ? undefined : value,
    });
  };

  const clearFilters = () => {
    setSearchInput("");
    onFiltersChange({
      searchTerm: undefined,
      categoryId: undefined,
      stockStatus: undefined,
      sortBy: "name",
      sortOrder: "asc",
    });
  };

  const activeFiltersCount = Object.values({
    searchTerm: filters.searchTerm,
    categoryId: filters.categoryId,
    stockStatus: filters.stockStatus,
  }).filter(Boolean).length;

  const stockStatusOptions = [
    { value: "all", label: "Tất cả trạng thái", icon: Filter },
    {
      value: "in_stock",
      label: "Còn hàng",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      value: "low_stock",
      label: "Sắp hết hàng",
      icon: AlertTriangle,
      color: "text-yellow-600",
    },
    {
      value: "out_of_stock",
      label: "Hết hàng",
      icon: XCircle,
      color: "text-red-600",
    },
  ];

  const sortOptions = [
    { value: "name", label: "Tên sản phẩm" },
    { value: "stock_quantity", label: "Số lượng tồn kho" },
    { value: "updated_at", label: "Cập nhật gần đây" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Bộ lọc kho hàng</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary">{activeFiltersCount} bộ lọc</Badge>
          )}
        </div>

        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="text-gray-600"
          >
            <X className="h-4 w-4 mr-2" />
            Xóa bộ lọc
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="lg:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>
        </form>

        {/* Category Filter */}
        <Select
          value={filters.categoryId?.toString() || "all"}
          onValueChange={(value) =>
            handleFilterChange(
              "categoryId",
              value === "all" ? undefined : Number(value)
            )
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            {categoriesData?.categories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Stock Status Filter */}
        <Select
          value={filters.stockStatus || "all"}
          onValueChange={(value) => handleFilterChange("stockStatus", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Trạng thái kho" />
          </SelectTrigger>
          <SelectContent>
            {stockStatusOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <IconComponent
                      className={`h-4 w-4 ${option.color || "text-gray-500"}`}
                    />
                    {option.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {/* Sort Options */}
        <div className="flex gap-2">
          <Select
            value={filters.sortBy || "name"}
            onValueChange={(value) => handleFilterChange("sortBy", value)}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Sắp xếp theo" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.sortOrder || "asc"}
            onValueChange={(value) => handleFilterChange("sortOrder", value)}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Tăng</SelectItem>
              <SelectItem value="desc">Giảm</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Bộ lọc đang áp dụng:</span>

            {filters.searchTerm && (
              <Badge variant="outline" className="gap-1">
                Tìm kiếm: &ldquo;{filters.searchTerm}&rdquo;
                <button
                  onClick={() => handleFilterChange("searchTerm", undefined)}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {filters.categoryId && (
              <Badge variant="outline" className="gap-1">
                Danh mục:{" "}
                {
                  categoriesData?.categories.find(
                    (c) => c.id === filters.categoryId
                  )?.name
                }
                <button
                  onClick={() => handleFilterChange("categoryId", undefined)}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {filters.stockStatus && (
              <Badge variant="outline" className="gap-1">
                {
                  stockStatusOptions.find(
                    (s) => s.value === filters.stockStatus
                  )?.label
                }
                <button
                  onClick={() => handleFilterChange("stockStatus", undefined)}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
