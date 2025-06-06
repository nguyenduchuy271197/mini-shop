"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Package,
  Download,
  FileSpreadsheet,
  FileText,
  MoreHorizontal,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AdminInventoryHeader() {
  const [isExporting, setIsExporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const handleExport = async (format: "csv" | "excel" | "pdf") => {
    setIsExporting(true);
    try {
      // Simulate API call for export
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const formatLabels = {
        csv: "CSV",
        excel: "Excel",
        pdf: "PDF",
      };

      toast({
        title: "Xuất báo cáo thành công",
        description: `Đã xuất báo cáo kho hàng định dạng ${formatLabels[format]} thành công`,
      });
    } catch {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi xuất báo cáo",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Simulate refresh
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: "Làm mới thành công",
        description: "Đã làm mới dữ liệu kho hàng",
      });
    } catch {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi làm mới dữ liệu",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLowStockReport = async () => {
    try {
      // Simulate generating low stock report
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast({
        title: "Tạo báo cáo thành công",
        description: "Đã tạo báo cáo sản phẩm sắp hết hàng",
      });
    } catch {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi tạo báo cáo",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
          <Package className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý kho hàng</h1>
          <p className="text-sm text-gray-600">
            Theo dõi và cập nhật tồn kho sản phẩm
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Refresh Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          {isRefreshing ? "Đang làm mới..." : "Làm mới"}
        </Button>

        {/* Low Stock Report */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleLowStockReport}
          className="flex items-center gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
        >
          <AlertTriangle className="h-4 w-4" />
          Báo cáo sắp hết hàng
        </Button>

        {/* Export Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {isExporting ? "Đang xuất..." : "Xuất báo cáo"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Định dạng xuất</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleExport("csv")}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              CSV File
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleExport("excel")}
              className="flex items-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Excel File
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleExport("pdf")}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              PDF Report
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* More Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Thao tác khác</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Nhập kho hàng loạt
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Cài đặt cảnh báo
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Lịch sử thay đổi kho
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
