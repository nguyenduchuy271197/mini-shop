"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface CategoriesFilters {
  searchTerm?: string;
  isActive?: boolean;
}

interface AdminCategoriesTableFiltersProps {
  filters: CategoriesFilters;
  onFiltersChange: (filters: CategoriesFilters) => void;
}

export function AdminCategoriesTableFilters({
  filters,
  onFiltersChange,
}: AdminCategoriesTableFiltersProps) {
  const handleSearchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      searchTerm: value || undefined,
    });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      isActive: value === "all" ? undefined : value === "active",
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = filters.searchTerm || filters.isActive !== undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Bộ lọc danh mục</h3>
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />
            Xóa bộ lọc
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative col-span-2">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo tên, slug, mô tả..."
            value={filters.searchTerm || ""}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

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
            <SelectItem value="active">Đang hoạt động</SelectItem>
            <SelectItem value="inactive">Tạm dừng</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
