"use client";

import { useProducts, useSearchProducts } from "@/hooks/products";
import ProductCard from "@/components/products/product-card";
import ProductsPagination from "./products-pagination";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Package } from "lucide-react";

interface ProductsGridProps {
  searchQuery: string;
  filters: {
    categoryId?: number;
    categoryIds?: number[]; // Array of category IDs for hierarchical filtering
    minPrice?: number;
    maxPrice?: number;
    brand?: string;
    inStock?: boolean;
  };
  sorting: {
    field: "name" | "price" | "created_at" | "stock_quantity";
    order: "asc" | "desc";
  };
  pagination: {
    page: number;
    limit: number;
  };
}

export default function ProductsGrid({
  searchQuery,
  filters,
  sorting,
  pagination,
}: ProductsGridProps) {
  const isSearching = searchQuery.trim().length > 0;

  // Use categoryIds if available, otherwise fall back to categoryId
  const categoryFilter =
    filters.categoryIds && filters.categoryIds.length > 0
      ? { categoryIds: filters.categoryIds }
      : filters.categoryId
      ? { categoryId: filters.categoryId }
      : {};

  // Use search hook if there's a search query, otherwise use regular products hook
  const searchResult = useSearchProducts({
    query: searchQuery,
    filters: {
      ...categoryFilter,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      brand: filters.brand,
      inStock: filters.inStock,
    },
    pagination,
  });

  const productsResult = useProducts(
    pagination,
    {
      ...categoryFilter,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      brand: filters.brand,
      inStock: filters.inStock,
    },
    sorting
  );

  // Choose the appropriate result based on whether we're searching
  const result = isSearching ? searchResult : productsResult;
  const { data, isLoading, error } = result;

  if (isLoading) {
    return <ProductsGridLoading />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Đã xảy ra lỗi khi tải sản phẩm. Vui lòng thử lại sau.
        </AlertDescription>
      </Alert>
    );
  }

  if (!data?.success) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {data?.error || "Không thể tải danh sách sản phẩm"}
        </AlertDescription>
      </Alert>
    );
  }

  const { products, pagination: paginationInfo } = data;

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Không tìm thấy sản phẩm
        </h3>
        <p className="text-muted-foreground">
          {isSearching
            ? `Không có sản phẩm nào khớp với từ khóa &ldquo;${searchQuery}&rdquo;`
            : "Không có sản phẩm nào phù hợp với bộ lọc của bạn"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Results Info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Hiển thị {products.length} trong tổng số {paginationInfo.total} sản
          phẩm
          {isSearching && (
            <span className="ml-1">cho &ldquo;{searchQuery}&rdquo;</span>
          )}
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      {paginationInfo.totalPages > 1 && (
        <ProductsPagination
          currentPage={paginationInfo.page}
          totalPages={paginationInfo.totalPages}
          total={paginationInfo.total}
          limit={paginationInfo.limit}
        />
      )}
    </div>
  );
}

// Loading component
function ProductsGridLoading() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-48" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-square w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
