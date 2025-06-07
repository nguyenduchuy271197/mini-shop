"use client";

import { useState, useMemo, useCallback } from "react";
import { AdminCustomersTableView } from "./admin-customers-table-view";
import { AdminCustomersFilters } from "./admin-customers-filters";
import { useAdminCustomers, CustomerFilters } from "@/hooks/admin/users";
import { Card } from "@/components/ui/card";

interface AdminCustomersTableProps {
  onCustomerSelect?: (customerId: string) => void;
}

export function AdminCustomersTable({
  onCustomerSelect,
}: AdminCustomersTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<CustomerFilters>({});

  const queryParams = useMemo(
    () => ({
      pagination: {
        page: currentPage,
        limit: pageSize,
      },
      filters,
    }),
    [currentPage, pageSize, filters]
  );

  const { data, isLoading, error, refetch } = useAdminCustomers(queryParams);

  const handleFiltersChange = useCallback((newFilters: CustomerFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset về trang đầu khi filter thay đổi
  }, []);

  const handleFiltersReset = useCallback(() => {
    setFilters({});
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <AdminCustomersFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={handleFiltersReset}
        />
      </Card>

      <AdminCustomersTableView
        customers={data?.customers || []}
        pagination={data?.pagination}
        isLoading={isLoading}
        error={error?.message}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onRefresh={handleRefresh}
        onCustomerSelect={onCustomerSelect}
      />
    </div>
  );
}
