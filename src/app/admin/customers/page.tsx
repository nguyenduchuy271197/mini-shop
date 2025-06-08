"use client";

import { useState, useCallback, useMemo } from "react";
import { AdminCustomersHeader } from "./_components/admin-customers-header";
import { AdminCustomersStats } from "./_components/admin-customers-stats";
import { AdminCustomersTable } from "./_components/admin-customers-table";
import { AdminCustomerDetailDialog } from "./_components/admin-customer-detail-dialog";
import { useAdminCustomers, useExportCustomers } from "@/hooks/admin/users";
import { useCustomerAnalytics } from "@/hooks/admin/reports";
import { useToast } from "@/hooks/use-toast";
import { CustomerMetrics } from "./_lib/utils";

export default function CustomersPage() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null
  );
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const { toast } = useToast();

  // Calculate date ranges for analytics
  const dateRanges = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    return {
      thisMonth: {
        startDate: startOfMonth.toISOString(),
        endDate: endOfMonth.toISOString(),
      },
      lastMonth: {
        startDate: startOfLastMonth.toISOString(),
        endDate: endOfLastMonth.toISOString(),
      },
    };
  }, []);

  // Get real analytics data
  const {
    data: thisMonthAnalytics,
    isLoading: isLoadingThisMonth,
    refetch: refetchThisMonth,
  } = useCustomerAnalytics({
    dateRange: dateRanges.thisMonth,
  });

  const {
    data: lastMonthAnalytics,
    isLoading: isLoadingLastMonth,
    refetch: refetchLastMonth,
  } = useCustomerAnalytics({
    dateRange: dateRanges.lastMonth,
  });

  // Lấy dữ liệu khách hàng để đếm tổng số
  const {
    data: customersData,
    isLoading: isLoadingCustomers,
    refetch: refetchCustomers,
  } = useAdminCustomers({
    pagination: { page: 1, limit: 50 }, // Increase to get better total count
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

  // Calculate real metrics from analytics data
  const metrics: CustomerMetrics = useMemo(() => {
    const totalCustomers = customersData?.pagination?.total || 0;
    const newCustomersThisMonth =
      thisMonthAnalytics?.analytics?.newCustomers || 0;
    const activeCustomers =
      thisMonthAnalytics?.analytics?.customerSegments?.activeCustomers || 0;

    // Use VIP customers from analytics
    const vipCustomers =
      thisMonthAnalytics?.analytics?.customerSegments?.vipCustomers || 0;

    const averageOrderValue =
      thisMonthAnalytics?.analytics?.averageOrderValue || 0;

    // Use retention rate from analytics
    const customerRetentionRate =
      thisMonthAnalytics?.analytics?.customerRetentionRate || 0;

    return {
      totalCustomers,
      newCustomersThisMonth,
      activeCustomers,
      vipCustomers,
      averageOrderValue,
      customerRetentionRate,
    };
  }, [customersData, thisMonthAnalytics]);

  const handleRefresh = useCallback(() => {
    refetchCustomers();
    refetchThisMonth();
    refetchLastMonth();
    toast({
      title: "Đã làm mới",
      description: "Dữ liệu khách hàng đã được cập nhật",
    });
  }, [refetchCustomers, refetchThisMonth, refetchLastMonth, toast]);

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

  const totalCustomers = metrics.totalCustomers;

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
        metrics={metrics}
        isLoading={isLoadingCustomers || isLoadingThisMonth}
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
