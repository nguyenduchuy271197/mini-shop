"use client";

import { useState, useCallback } from "react";
import { AdminCustomersHeader } from "./_components/admin-customers-header";
import { AdminCustomersStats } from "./_components/admin-customers-stats";
import { AdminCustomersTable } from "./_components/admin-customers-table";
import { AdminCustomerDetailDialog } from "./_components/admin-customer-detail-dialog";
import { useAdminCustomers, useExportCustomers } from "@/hooks/admin/users";
import { useToast } from "@/hooks/use-toast";
import { CustomerMetrics } from "./_lib/utils";

export default function CustomersPage() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null
  );
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const { toast } = useToast();

  // Mock metrics - trong thực tế sẽ fetch từ API
  const mockMetrics: CustomerMetrics = {
    totalCustomers: 1250,
    newCustomersThisMonth: 85,
    activeCustomers: 890,
    vipCustomers: 45,
    averageOrderValue: 750000,
    customerRetentionRate: 68.5,
  };

  // Lấy dữ liệu khách hàng để đếm tổng số
  const {
    data: customersData,
    isLoading: isLoadingCustomers,
    refetch: refetchCustomers,
  } = useAdminCustomers({
    pagination: { page: 1, limit: 1 },
    filters: {},
  });

  const { mutateAsync: exportCustomers, isPending: isExporting } =
    useExportCustomers({
      onSuccess: (data) => {
        toast({
          title: "Xuất dữ liệu thành công",
          description: `Đã xuất ${data.totalRecords} khách hàng vào file CSV`,
        });
      },
      onError: (error) => {
        toast({
          title: "Lỗi xuất dữ liệu",
          description: error,
          variant: "destructive",
        });
      },
    });

  const handleRefresh = useCallback(() => {
    refetchCustomers();
    toast({
      title: "Đã làm mới",
      description: "Dữ liệu khách hàng đã được cập nhật",
    });
  }, [refetchCustomers, toast]);

  const handleExport = useCallback(async () => {
    try {
      await exportCustomers({
        format: "csv",
        filters: {},
      });
    } catch (error) {
      // Error handling được xử lý trong onError callback
      console.error("Export failed:", error);
    }
  }, [exportCustomers]);

  const handleCustomerSelect = useCallback((customerId: string) => {
    setSelectedCustomerId(customerId);
    setIsDetailDialogOpen(true);
  }, []);

  const handleCloseDetailDialog = useCallback(() => {
    setIsDetailDialogOpen(false);
    // Delay reset selected customer để tránh flicker
    setTimeout(() => setSelectedCustomerId(null), 300);
  }, []);

  const totalCustomers =
    customersData?.pagination?.total || mockMetrics.totalCustomers;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <AdminCustomersHeader
        onRefresh={handleRefresh}
        onExport={handleExport}
        isLoading={isLoadingCustomers || isExporting}
        totalCustomers={totalCustomers}
      />

      {/* Stats */}
      <AdminCustomersStats
        metrics={mockMetrics}
        isLoading={isLoadingCustomers}
      />

      {/* Table */}
      <AdminCustomersTable onCustomerSelect={handleCustomerSelect} />

      {/* Detail Dialog */}
      <AdminCustomerDetailDialog
        customerId={selectedCustomerId}
        open={isDetailDialogOpen}
        onOpenChange={handleCloseDetailDialog}
      />
    </div>
  );
}
