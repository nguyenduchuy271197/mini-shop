"use client";

import { RevenueAnalytics } from "../_components/revenue-analytics";
import type { RevenueAnalytics as RevenueAnalyticsType } from "@/hooks/admin/reports";
import { useToast } from "@/hooks/use-toast";

export default function RevenueReportsPage() {
  const { toast } = useToast();

  const handleExportData = (data: RevenueAnalyticsType) => {
    console.log("Exporting revenue data:", data);

    // Create JSON download
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `revenue-report-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Xuất báo cáo thành công",
      description: "Báo cáo doanh thu đã được tải xuống",
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Báo Cáo Doanh Thu</h1>
        <p className="text-gray-600 mt-2">
          Phân tích chi tiết doanh thu theo thời gian và các yếu tố khác
        </p>
      </div>

      <RevenueAnalytics onExport={handleExportData} />
    </div>
  );
}
