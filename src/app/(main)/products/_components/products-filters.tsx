"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCategoryTree } from "@/hooks/categories";
import { Loader2, Filter, X } from "lucide-react";

interface ProductsFiltersProps {
  filters: {
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    brand?: string;
    inStock?: boolean;
  };
  brand?: string;
}

export default function ProductsFilters({
  filters,
  brand = "",
}: ProductsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: categoryData, isLoading: categoriesLoading } = useCategoryTree({
    includeProductCount: true,
  });

  const [minPrice, setMinPrice] = useState(filters.minPrice?.toString() || "");
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice?.toString() || "");
  const [brandFilter, setBrandFilter] = useState(brand);

  const categories = categoryData?.success ? categoryData.categories : [];

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);

    if (value && value !== "") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Reset to first page when filtering
    params.set("page", "1");

    router.push(`/products?${params.toString()}`);
  };

  const handleCategoryChange = (categoryId: number, checked: boolean) => {
    if (checked) {
      updateFilter("category", categoryId.toString());
    } else {
      updateFilter("category", null);
    }
  };

  const handlePriceFilter = () => {
    const params = new URLSearchParams(searchParams);

    if (minPrice) {
      params.set("minPrice", minPrice);
    } else {
      params.delete("minPrice");
    }

    if (maxPrice) {
      params.set("maxPrice", maxPrice);
    } else {
      params.delete("maxPrice");
    }

    params.set("page", "1");
    router.push(`/products?${params.toString()}`);
  };

  const handleBrandFilter = () => {
    updateFilter("brand", brandFilter);
  };

  const handleInStockChange = (checked: boolean) => {
    updateFilter("inStock", checked ? "true" : null);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("category");
    params.delete("minPrice");
    params.delete("maxPrice");
    params.delete("brand");
    params.delete("inStock");
    params.set("page", "1");

    setMinPrice("");
    setMaxPrice("");
    setBrandFilter("");

    router.push(`/products?${params.toString()}`);
  };

  const hasActiveFilters =
    filters.categoryId ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.brand ||
    filters.inStock;

  return (
    <div className="space-y-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          <h3 className="font-semibold">Bộ lọc</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Xóa bộ lọc
          </Button>
        )}
      </div>

      {/* Categories Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Danh mục</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categoriesLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">
                Đang tải danh mục...
              </span>
            </div>
          ) : categories.length > 0 ? (
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={filters.categoryId === category.id}
                    onCheckedChange={(checked) =>
                      handleCategoryChange(category.id, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`category-${category.id}`}
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    <div className="flex items-center justify-between">
                      <span>{category.name}</span>
                      {category.product_count !== undefined && (
                        <span className="text-xs text-muted-foreground">
                          ({category.product_count})
                        </span>
                      )}
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Không có danh mục nào
            </p>
          )}
        </CardContent>
      </Card>

      {/* Price Range Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Giá</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="min-price" className="text-sm">
                Giá tối thiểu
              </Label>
              <Input
                id="min-price"
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="max-price" className="text-sm">
                Giá tối đa
              </Label>
              <Input
                id="max-price"
                type="number"
                placeholder="999,999,999"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <Button
            onClick={handlePriceFilter}
            className="w-full"
            variant="outline"
            size="sm"
          >
            Áp dụng
          </Button>
        </CardContent>
      </Card>

      {/* Brand Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Thương hiệu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Nhập tên thương hiệu..."
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
          />
          <Button
            onClick={handleBrandFilter}
            className="w-full"
            variant="outline"
            size="sm"
          >
            Áp dụng
          </Button>
        </CardContent>
      </Card>

      {/* Stock Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Tình trạng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="in-stock"
              checked={filters.inStock || false}
              onCheckedChange={handleInStockChange}
            />
            <Label
              htmlFor="in-stock"
              className="text-sm font-normal cursor-pointer"
            >
              Chỉ hiển thị sản phẩm có sẵn
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
