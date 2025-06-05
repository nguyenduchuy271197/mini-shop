"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { importProductsFromCSV } from "@/actions/admin/products/import-products";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/types/custom.types";

interface ImportProductsData {
  csvData: string;
  overwrite?: boolean;
  validateOnly?: boolean;
}

interface UseImportProductsOptions {
  onSuccess?: (result: { 
    imported: number; 
    updated: number; 
    skipped: number; 
    errors: string[];
    products?: Product[];
  }) => void;
  onError?: (error: string) => void;
}

function isClientError(error: Error): boolean {
  return error.message.includes("CSV") || 
         error.message.includes("không được để trống") ||
         error.message.includes("có lỗi trong") ||
         error.message.includes("định dạng");
}

export function useImportProducts(options: UseImportProductsOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ImportProductsData) => {
      const processedData = {
        ...data,
        overwrite: data.overwrite ?? false,
        validateOnly: data.validateOnly ?? false,
      };
      
      const result = await importProductsFromCSV(processedData);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result;
    },
    onSuccess: (result, variables) => {
      // Only invalidate cache if not validation only
      if (!variables.validateOnly) {
        // Invalidate and refetch admin products
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.admin.products.all,
        });

        // Also invalidate public products
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.products.all,
        });

        // Invalidate categories if products were assigned to categories
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.categories.all,
        });
      }

      const isValidationOnly = variables.validateOnly;
      
      toast({
        title: isValidationOnly ? "Xác thực thành công" : "Import thành công",
        description: result.message,
        variant: result.errors.length > 0 ? "default" : "default",
      });

      // Show additional error details if there are errors
      if (result.errors.length > 0) {
        setTimeout(() => {
          toast({
            title: `Có ${result.errors.length} lỗi cần chú ý`,
            description: result.errors.slice(0, 3).join("; ") + (result.errors.length > 3 ? "..." : ""),
            variant: "destructive",
          });
        }, 2000);
      }

      options.onSuccess?.({
        imported: result.imported,
        updated: result.updated,
        skipped: result.skipped,
        errors: result.errors,
        products: result.products,
      });
    },
    onError: (error: Error) => {
      const isClientErr = isClientError(error);
      
      toast({
        title: isClientErr ? "Lỗi dữ liệu CSV" : "Lỗi hệ thống",
        description: error.message,
        variant: "destructive",
      });

      options.onError?.(error.message);
    },
    retry: (failureCount, error) => {
      // Don't retry on client errors (CSV format issues, validation errors)
      if (isClientError(error as Error)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export type { ImportProductsData, UseImportProductsOptions }; 