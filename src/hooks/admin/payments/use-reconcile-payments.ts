"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reconcilePayments } from "@/actions/admin/payments/reconcile-payments";
import { useToast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";

interface ReconcilePaymentsData {
  date: string;
  includePartial?: boolean;
  autoFix?: boolean;
}

interface ReconciliationIssue {
  type: "amount_mismatch" | "status_mismatch" | "missing_payment" | "duplicate_payment" | "orphan_payment";
  severity: "low" | "medium" | "high";
  payment_id?: number;
  order_id?: number;
  order_number?: string;
  description: string;
  expected_value?: string | number;
  actual_value?: string | number;
  suggestion?: string;
  auto_fixable: boolean;
}

interface ReconciliationSummary {
  total_payments_checked: number;
  total_orders_checked: number;
  total_issues_found: number;
  issues_by_type: Record<string, number>;
  issues_by_severity: Record<string, number>;
  total_amount_discrepancy: number;
  auto_fixed_count: number;
}

interface ReconcilePaymentsResponse {
  success: true;
  message: string;
  reconciliation: {
    date: string;
    summary: ReconciliationSummary;
    issues: ReconciliationIssue[];
    fixed_issues: ReconciliationIssue[];
  };
}

interface UseReconcilePaymentsOptions {
  onSuccess?: (result: ReconcilePaymentsResponse) => void;
  onError?: (error: string) => void;
}

function isClientError(error: Error): boolean {
  return error.message.includes("Ngày không hợp lệ") ||
         error.message.includes("không tìm thấy") ||
         error.message.includes("không hợp lệ");
}

export function useReconcilePayments(options: UseReconcilePaymentsOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ReconcilePaymentsData) => {
      const result = await reconcilePayments({
        date: data.date,
        includePartial: data.includePartial ?? false,
        autoFix: data.autoFix ?? false,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as ReconcilePaymentsResponse;
    },
    onSuccess: (result) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.admin.payments.all 
      });

      const { summary, issues, fixed_issues } = result.reconciliation;

      // Show success toast with summary
      if (summary.total_issues_found === 0) {
        toast({
          title: "Đối soát hoàn tất",
          description: `Kiểm tra ${summary.total_payments_checked} thanh toán - Không phát hiện vấn đề`,
        });
      } else {
        toast({
          title: "Đối soát hoàn tất",
          description: `Phát hiện ${summary.total_issues_found} vấn đề${fixed_issues.length > 0 ? `, đã tự động sửa ${fixed_issues.length} vấn đề` : ""}`,
          variant: summary.total_issues_found > fixed_issues.length ? "destructive" : "default",
        });
      }

      // Show additional info for high severity issues
      const highSeverityIssues = issues.filter(issue => issue.severity === "high");
      if (highSeverityIssues.length > 0) {
        toast({
          title: "Cảnh báo nghiêm trọng",
          description: `${highSeverityIssues.length} vấn đề nghiêm trọng cần xử lý ngay`,
          variant: "destructive",
        });
      }

      options.onSuccess?.(result);
    },
    onError: (error: Error) => {
      const isClientErr = isClientError(error);
      
      toast({
        title: isClientErr ? "Không thể đối soát" : "Lỗi hệ thống",
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
  ReconcilePaymentsData, 
  ReconciliationIssue, 
  ReconciliationSummary,
  ReconcilePaymentsResponse,
  UseReconcilePaymentsOptions 
}; 