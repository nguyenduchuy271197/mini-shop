"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminPageWrapper } from "@/components/admin/admin-page-wrapper";
import { AdminPaymentsHeader } from "./_components/admin-payments-header";
import { AdminPaymentsFilters } from "./_components/admin-payments-filters";
import { AdminPaymentsTable } from "./_components/admin-payments-table";
import { PaymentFilters, useExportPayments } from "@/hooks/admin/payments";
import { useToast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";

export default function AdminPaymentsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Default filters
  const [filters, setFilters] = useState<PaymentFilters>({});

  // Export mutation
  const exportMutation = useExportPayments();

  const handleFiltersChange = (newFilters: PaymentFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({});
  };

  const handleExport = () => {
    exportMutation.mutate({
      filters,
      format: "csv",
    });
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);

      // Invalidate all payment queries to force refresh
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.admin.payments.all,
      });

      toast({
        title: "Đã làm mới dữ liệu",
        description: "Dữ liệu thanh toán đã được cập nhật",
      });
    } catch {
      toast({
        title: "Lỗi làm mới",
        description: "Không thể làm mới dữ liệu. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <AdminPageWrapper spacing="loose" container={false}>
      {/* Header */}
      <AdminPaymentsHeader
        onExport={handleExport}
        onRefresh={handleRefresh}
        isExporting={exportMutation.isPending}
        isLoading={isRefreshing}
      />

      {/* Main Content */}
      <div className="space-y-6">
        {/* Filters */}
        <AdminPaymentsFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={handleResetFilters}
        />

        {/* Payments Table */}
        <AdminPaymentsTable filters={filters} />
      </div>
    </AdminPageWrapper>
  );
}
