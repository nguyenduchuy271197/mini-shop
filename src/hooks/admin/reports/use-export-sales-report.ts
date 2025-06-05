"use client";

import { useMutation } from "@tanstack/react-query";
import { exportSalesReport } from "@/actions/admin/reports/export-sales-report";
import { useToast } from "@/hooks/use-toast";

interface DateRange {
  startDate: string;
  endDate: string;
}

type ExportFormat = "excel" | "pdf";

interface ExportSalesReportData {
  dateRange: DateRange;
  format: ExportFormat;
}

interface ExportSalesReportResponse {
  success: true;
  downloadUrl: string;
  fileName: string;
  fileSize: number;
}

interface UseExportSalesReportOptions {
  onSuccess?: (result: ExportSalesReportResponse) => void;
  onError?: (error: string) => void;
}

function isClientError(error: Error): boolean {
  return error.message.includes("Ngày bắt đầu không hợp lệ") ||
         error.message.includes("Ngày kết thúc không hợp lệ") ||
         error.message.includes("Ngày kết thúc phải sau ngày bắt đầu") ||
         error.message.includes("Định dạng file là bắt buộc") ||
         error.message.includes("Định dạng file không hợp lệ") ||
         error.message.includes("chưa được xác thực") ||
         error.message.includes("Chỉ admin");
}

export function useExportSalesReport(options: UseExportSalesReportOptions = {}) {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: ExportSalesReportData) => {
      const result = await exportSalesReport(data.dateRange, data.format);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as ExportSalesReportResponse;
    },
    onSuccess: (result) => {
      // Show success toast with download info
      toast({
        title: "Export báo cáo thành công",
        description: `File ${result.fileName} đã được tạo (${Math.round(result.fileSize / 1024)}KB). Đang tải xuống...`,
      });

      // Trigger download
      const link = document.createElement('a');
      link.href = result.downloadUrl;
      link.download = result.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      options.onSuccess?.(result);
    },
    onError: (error: Error) => {
      const isClientErr = isClientError(error);
      
      toast({
        title: isClientErr ? "Không thể export báo cáo" : "Lỗi hệ thống",
        description: error.message,
        variant: "destructive",
      });

      options.onError?.(error.message);
    },
    retry: (failureCount, error) => {
      // Don't retry on client errors (authorization, validation, etc.)
      if (isClientError(error as Error)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export type { 
  DateRange,
  ExportFormat,
  ExportSalesReportData, 
  ExportSalesReportResponse,
  UseExportSalesReportOptions 
}; 