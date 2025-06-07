import ProductsGrid from "./_components/products-grid";
import ProductsFilters from "./_components/products-filters";
import ProductsSearch from "./_components/products-search";
import ProductsSorting from "./_components/products-sorting";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductsPageProps {
  searchParams: {
    page?: string;
    limit?: string;
    search?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    brand?: string;
    sortBy?: string;
    sortOrder?: string;
    inStock?: string;
  };
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  // Parse search params
  const page = parseInt(searchParams.page || "1");
  const limit = parseInt(searchParams.limit || "12");
  const search = searchParams.search || "";

  // Handle both single category ID and comma-separated category IDs
  const categoryIds = searchParams.category
    ? searchParams.category
        .split(",")
        .map((id) => parseInt(id.trim()))
        .filter((id) => !isNaN(id))
    : [];
  const categoryId = categoryIds.length > 0 ? categoryIds[0] : undefined; // For display purposes

  const minPrice = searchParams.minPrice
    ? parseFloat(searchParams.minPrice)
    : undefined;
  const maxPrice = searchParams.maxPrice
    ? parseFloat(searchParams.maxPrice)
    : undefined;
  const brand = searchParams.brand || "";
  const sortBy = searchParams.sortBy || "created_at";
  const sortOrder = searchParams.sortOrder || "desc";
  const inStock = searchParams.inStock === "true";

  const filters = {
    categoryId,
    categoryIds: categoryIds.length > 0 ? categoryIds : undefined, // Pass array for filtering
    minPrice,
    maxPrice,
    brand: brand || undefined,
    inStock: inStock || undefined,
  };

  const sorting = {
    field: sortBy as "name" | "price" | "created_at" | "stock_quantity",
    order: sortOrder as "asc" | "desc",
  };

  const pagination = { page, limit };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sản phẩm</h1>
          <p className="text-gray-600 mt-2">
            Khám phá bộ sưu tập sản phẩm chất lượng cao của chúng tôi
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <ProductsSearch initialQuery={search} />
        </div>

        {/* Layout: Filters + Products */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <Suspense fallback={<FiltersLoading />}>
              <ProductsFilters
                filters={{
                  categoryId,
                  minPrice,
                  maxPrice,
                  brand,
                  inStock,
                }}
                brand={brand}
              />
            </Suspense>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Sorting */}
            <div className="mb-6 flex justify-between items-center">
              <ProductsSorting
                sortBy={sorting.field}
                sortOrder={sorting.order}
              />
            </div>

            {/* Products Grid */}
            <Suspense fallback={<ProductsGridLoading />}>
              <ProductsGrid
                searchQuery={search}
                filters={filters}
                sorting={sorting}
                pagination={pagination}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading components
function FiltersLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-20" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductsGridLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}
