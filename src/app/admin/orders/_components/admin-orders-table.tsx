"use client";

import { useState } from "react";
import { AdminOrdersFilters } from "./admin-orders-filters";
import { AdminOrdersTableView } from "./admin-orders-table-view";
import { AdminOrdersBulkActions } from "./admin-orders-bulk-actions";
import { OrderFilters } from "@/hooks/admin/orders";

export function AdminOrdersTable() {
  const [filters, setFilters] = useState<OrderFilters>({});
  const [page, setPage] = useState(1);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);

  const handleFiltersChange = (newFilters: OrderFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset page when filters change
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleOrderSelection = (orderId: number, selected: boolean) => {
    setSelectedOrders((prev) =>
      selected ? [...prev, orderId] : prev.filter((id) => id !== orderId)
    );
  };

  const handleBulkSelection = (orderIds: number[], selected: boolean) => {
    setSelectedOrders((prev) => {
      if (selected) {
        const combined = [...prev, ...orderIds];
        return Array.from(new Set(combined));
      } else {
        return prev.filter((id) => !orderIds.includes(id));
      }
    });
  };

  const clearSelection = () => {
    setSelectedOrders([]);
  };

  return (
    <div className="space-y-6">
      <AdminOrdersFilters onFiltersChange={handleFiltersChange} />

      {selectedOrders.length > 0 && (
        <AdminOrdersBulkActions
          selectedOrders={selectedOrders}
          onClearSelection={clearSelection}
        />
      )}

      <AdminOrdersTableView
        filters={filters}
        page={page}
        onPageChange={handlePageChange}
        selectedOrders={selectedOrders}
        onOrderSelection={handleOrderSelection}
        onBulkSelection={handleBulkSelection}
      />
    </div>
  );
}
