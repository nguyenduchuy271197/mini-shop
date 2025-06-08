"use client";

import { AdminPageWrapper } from "@/components/admin/admin-page-wrapper";
import { BestSellingProducts } from "../_components/best-selling-products";
import type { BestSellingProduct } from "@/hooks/admin/reports";
import { useToast } from "@/hooks/use-toast";

export default function ProductsReportsPage() {
  const { toast } = useToast();

  const handleExportData = (data: BestSellingProduct[]) => {
    console.log("Exporting products data:", data);

    // Create JSON download
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `best-selling-products-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Xuất báo cáo thành công",
      description: "Báo cáo sản phẩm bán chạy đã được tải xuống",
    });
  };

  return (
    <AdminPageWrapper>
      <BestSellingProducts onExport={handleExportData} />
    </AdminPageWrapper>
  );
}
