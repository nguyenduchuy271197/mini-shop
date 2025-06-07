"use client";

import { useState } from "react";
import { format, subDays } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminPaymentsHeader } from "./_components/admin-payments-header";
import { AdminPaymentsAnalytics } from "./_components/admin-payments-analytics";
import { AdminPaymentsFilters } from "./_components/admin-payments-filters";
import { AdminPaymentsTable } from "./_components/admin-payments-table";
import { AdminPaymentsReconciliation } from "./_components/admin-payments-reconciliation";
import { PaymentFilters } from "@/hooks/admin/payments";
import { useToast } from "@/hooks/use-toast";

// Mock export function - replace with actual implementation
const exportPayments = async () => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    success: true,
    data: [],
    filename: `payments-export-${format(new Date(), "yyyy-MM-dd")}.csv`,
  };
};

export default function AdminPaymentsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("list");
  const [isExporting, setIsExporting] = useState(false);
  const [isReconciling, setIsReconciling] = useState(false);

  // Default date range - last 30 days
  const [analyticsDateRange] = useState({
    startDate: format(subDays(new Date(), 30), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
  });

  // Default filters
  const [filters, setFilters] = useState<PaymentFilters>({});

  const handleFiltersChange = (newFilters: PaymentFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({});
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);

      const result = await exportPayments();

      if (result.success) {
        // Create and download CSV
        const csvContent = `data:text/csv;charset=utf-8,${encodeURIComponent(
          "ID Giao dịch,Mã đơn hàng,Email khách hàng,Phương thức,Số tiền,Trạng thái,Ngày tạo,Ngày xử lý,Mã giao dịch\n"
        )}`;

        const link = document.createElement("a");
        link.setAttribute("href", csvContent);
        link.setAttribute("download", result.filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: "Xuất báo cáo thành công",
          description: `Đã tải xuống file ${result.filename}`,
        });
      } else {
        throw new Error("Không thể xuất báo cáo");
      }
    } catch (error) {
      toast({
        title: "Lỗi xuất báo cáo",
        description:
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra khi xuất báo cáo",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleReconcile = () => {
    setIsReconciling(true);
    setActiveTab("reconciliation");
  };

  const handleRefresh = () => {
    // Force re-fetch data by updating filters
    setFilters({ ...filters });

    toast({
      title: "Đã làm mới dữ liệu",
      description: "Dữ liệu thanh toán đã được cập nhật",
    });
  };

  const handleReconciliationComplete = () => {
    setIsReconciling(false);

    // Refresh the main data after reconciliation
    handleRefresh();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <AdminPaymentsHeader
        onExport={handleExport}
        onReconcile={handleReconcile}
        onRefresh={handleRefresh}
        isExporting={isExporting}
        isReconciling={isReconciling}
        isLoading={false}
      />

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">Danh sách giao dịch</TabsTrigger>
          <TabsTrigger value="analytics">Báo cáo & Thống kê</TabsTrigger>
          <TabsTrigger value="reconciliation">Đối soát thanh toán</TabsTrigger>
        </TabsList>

        {/* Payments List */}
        <TabsContent value="list" className="space-y-6">
          {/* Filters */}
          <AdminPaymentsFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onReset={handleResetFilters}
          />

          {/* Payments Table */}
          <AdminPaymentsTable filters={filters} />
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <AdminPaymentsAnalytics dateRange={analyticsDateRange} />
        </TabsContent>

        {/* Reconciliation */}
        <TabsContent value="reconciliation" className="space-y-6">
          <AdminPaymentsReconciliation
            onReconciliationComplete={handleReconciliationComplete}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
