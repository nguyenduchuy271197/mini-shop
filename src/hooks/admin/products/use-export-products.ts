"use client";

import { useMutation } from "@tanstack/react-query";
import { exportProducts } from "@/actions/admin/products/export-products";
import { useToast } from "@/hooks/use-toast";

interface ExportFilters {
  categoryId?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  lowStock?: boolean;
  outOfStock?: boolean;
  searchTerm?: string;
}

interface ExportProductsData {
  filters?: ExportFilters;
  format?: "csv" | "json";
  includeInactive?: boolean;
}

interface UseExportProductsOptions {
  onSuccess?: (result: { data: string; fileName: string; totalExported: number }) => void;
  onError?: (error: string) => void;
}

function isClientError(error: Error): boolean {
  return error.message.includes("không có sản phẩm") || 
         error.message.includes("không hợp lệ") ||
         error.message.includes("định dạng");
}

// Helper function to trigger download
function downloadFile(data: string, fileName: string, format: "csv" | "json") {
  const mimeType = format === "csv" ? "text/csv" : "application/json";
  const blob = new Blob([data], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function useExportProducts(options: UseExportProductsOptions = {}) {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: ExportProductsData = {}) => {
      const processedData = {
        filters: data.filters ?? {},
        format: data.format ?? "csv" as const,
        includeInactive: data.includeInactive ?? false,
      };
      
      const result = await exportProducts(processedData);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result;
    },
    onSuccess: (result, variables) => {
      // Automatically download the file
      const format = variables?.format ?? "csv";
      downloadFile(result.data, result.fileName, format);

      toast({
        title: "Xuất dữ liệu thành công",
        description: result.message,
      });

      options.onSuccess?.({
        data: result.data,
        fileName: result.fileName,
        totalExported: result.totalExported,
      });
    },
    onError: (error: Error) => {
      const isClientErr = isClientError(error);
      
      toast({
        title: isClientErr ? "Lỗi xuất dữ liệu" : "Lỗi hệ thống",
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

export type { ExportProductsData, ExportFilters, UseExportProductsOptions }; 