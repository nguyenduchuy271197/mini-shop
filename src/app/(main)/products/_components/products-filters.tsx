"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCategories } from "@/hooks/categories";
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
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories({
    includeProductCount: true,
  });

  const [minPrice, setMinPrice] = useState(filters.minPrice?.toString() || "");
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice?.toString() || "");
  const [brandFilter, setBrandFilter] = useState(brand);

  const categories = categoriesData?.success ? categoriesData.categories : [];

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
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Bộ lọc
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Categories */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Danh mục</Label>
          {categoriesLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tải...
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
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
                    {category.name}
                    {category.product_count !== undefined && (
                      <span className="text-muted-foreground ml-1">
                        ({category.product_count})
                      </span>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Price Range */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Khoảng giá</Label>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Từ"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="text-sm"
              />
              <Input
                type="number"
                placeholder="Đến"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="text-sm"
              />
            </div>
            <Button
              onClick={handlePriceFilter}
              size="sm"
              className="w-full"
              variant="outline"
            >
              Áp dụng
            </Button>
          </div>
        </div>

        <Separator />

        {/* Brand */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Thương hiệu</Label>
          <div className="space-y-3">
            <Input
              type="text"
              placeholder="Nhập tên thương hiệu"
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="text-sm"
            />
            <Button
              onClick={handleBrandFilter}
              size="sm"
              className="w-full"
              variant="outline"
            >
              Tìm kiếm
            </Button>
          </div>
        </div>

        <Separator />

        {/* Stock Status */}
        <div>
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
              Chỉ hiển thị sản phẩm còn hàng
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
