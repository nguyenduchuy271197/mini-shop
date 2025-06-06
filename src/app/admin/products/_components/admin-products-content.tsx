"use client";

import { useState, Suspense } from "react";
import { AdminProductsTable } from "./admin-products-table";
import { AdminProductsFilters } from "./admin-products-filters";

interface ProductsFilters {
  searchTerm?: string;
  categoryId?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  stockStatus?: "in_stock" | "low_stock" | "out_of_stock";
}

export function AdminProductsContent() {
  const [filters, setFilters] = useState<ProductsFilters>({});

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Suspense
        fallback={<div className="h-16 bg-gray-100 rounded-lg animate-pulse" />}
      >
        <AdminProductsFilters filters={filters} onFiltersChange={setFilters} />
      </Suspense>

      {/* Products Table */}
      <Suspense
        fallback={<div className="h-96 bg-gray-100 rounded-lg animate-pulse" />}
      >
        <AdminProductsTable filters={filters} />
      </Suspense>
    </div>
  );
}
