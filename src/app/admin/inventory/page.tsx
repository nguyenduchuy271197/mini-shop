"use client";

import { Suspense, useState } from "react";
import { AdminPageWrapper } from "@/components/admin/admin-page-wrapper";
import { AdminInventoryHeader } from "./_components/admin-inventory-header";
import { AdminInventoryTable } from "./_components/admin-inventory-table";
import { AdminInventoryFilters } from "./_components/admin-inventory-filters";
import { AdminInventoryStatsWrapper } from "./_components/admin-inventory-stats-wrapper";
import { AdminLowStockAlertWrapper } from "./_components/admin-low-stock-alert-wrapper";

interface InventoryFilters {
  searchTerm?: string;
  categoryId?: number;
  stockStatus?: "all" | "in_stock" | "low_stock" | "out_of_stock";
  sortBy?: "name" | "stock_quantity" | "updated_at";
  sortOrder?: "asc" | "desc";
}

export default function AdminInventoryPage() {
  const [filters, setFilters] = useState<InventoryFilters>({
    sortBy: "name",
    sortOrder: "asc",
  });

  const handleFiltersChange = (newFilters: InventoryFilters) => {
    setFilters(newFilters);
  };

  return (
    <AdminPageWrapper>
      {/* Page Header */}
      <AdminInventoryHeader />

      {/* Statistics */}
      <Suspense
        fallback={<div className="h-24 bg-gray-100 rounded-lg animate-pulse" />}
      >
        <AdminInventoryStatsWrapper />
      </Suspense>

      {/* Low Stock Alert */}
      <Suspense
        fallback={
          <div className="h-20 bg-orange-100 rounded-lg animate-pulse" />
        }
      >
        <AdminLowStockAlertWrapper />
      </Suspense>

      {/* Filters */}
      <Suspense
        fallback={<div className="h-16 bg-gray-100 rounded-lg animate-pulse" />}
      >
        <AdminInventoryFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      </Suspense>

      {/* Inventory Table */}
      <Suspense
        fallback={<div className="h-96 bg-gray-100 rounded-lg animate-pulse" />}
      >
        <AdminInventoryTable filters={filters} />
      </Suspense>
    </AdminPageWrapper>
  );
}
