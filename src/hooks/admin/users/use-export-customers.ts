"use client";

import { useMutation } from "@tanstack/react-query";
import { exportCustomers } from "@/actions/admin/users/export-customers";
import { useToast } from "@/hooks/use-toast";

interface ExportCustomersFilters {
  search?: string;
  isActive?: boolean;
  gender?: "male" | "female" | "other";
  hasOrders?: boolean;
  registeredAfter?: string;
  registeredBefore?: string;
  includeOrderStats?: boolean;
  includeAddresses?: boolean;
}

interface ExportCustomersData {
  filters?: ExportCustomersFilters;
  format?: "csv" | "json";
}

interface UseExportCustomersOptions {
  onSuccess?: (result: { filename: string; totalRecords: number }) => void;
  onError?: (error: string) => void;
}

function isClientError(error: Error): boolean {
  return error.message.includes("không tìm thấy khách hàng để xuất") ||
         error.message.includes("không hợp lệ");
}

function downloadFile(data: string, filename: string, format: "csv" | "json") {
  const mimeType = format === "csv" ? "text/csv" : "application/json";
  const blob = new Blob([data], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  window.URL.revokeObjectURL(url);
}

export function useExportCustomers(options: UseExportCustomersOptions = {}) {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: ExportCustomersData = {}) => {
      const processedData = {
        filters: data.filters ? {
          ...data.filters,
          includeOrderStats: data.filters.includeOrderStats ?? true,
          includeAddresses: data.filters.includeAddresses ?? false,
        } : undefined,
        format: data.format ?? "csv",
      };
      
      const result = await exportCustomers(processedData);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result;
    },
    onSuccess: (result) => {
      // Automatically download the file
      downloadFile(result.data, result.filename, result.format);

      toast({
        title: "Xuất thành công",
        description: `Đã xuất ${result.totalRecords} khách hàng thành file ${result.format.toUpperCase()}`,
      });

      options.onSuccess?.({
        filename: result.filename,
        totalRecords: result.totalRecords,
      });
    },
    onError: (error: Error) => {
      const isClientErr = isClientError(error);
      
      toast({
        title: isClientErr ? "Không thể xuất" : "Lỗi hệ thống",
        description: error.message,
        variant: "destructive",
      });

      options.onError?.(error.message);
    },
    retry: (failureCount, error) => {
      // Don't retry on client errors (no data to export, etc.)
      if (isClientError(error as Error)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export type { ExportCustomersData, ExportCustomersFilters, UseExportCustomersOptions }; 