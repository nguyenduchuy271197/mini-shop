"use client";

import { useMutation } from "@tanstack/react-query";
import { exportPayments } from "@/actions/admin/payments/export-payments";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface ExportPaymentsFilters {
  status?: "pending" | "processing" | "completed" | "failed" | "cancelled" | "refunded";
  paymentMethod?: "vnpay" | "cod" | "stripe";
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

interface ExportPaymentsParams {
  filters?: ExportPaymentsFilters;
  format?: "csv";
}

export function useExportPayments() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: ExportPaymentsParams) => {
      const result = await exportPayments({
        filters: params.filters,
        format: params.format || "csv",
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      return result;
    },
    onSuccess: (data) => {
      // Prepare CSV data
      const csvHeaders = [
        "ID Giao dịch",
        "Mã đơn hàng", 
        "Email khách hàng",
        "Tên khách hàng",
        "Phương thức",
        "Số tiền (VND)",
        "Trạng thái",
        "Ngày tạo",
        "Ngày xử lý",
        "Mã giao dịch",
        "Stripe Session ID",
        "Stripe Payment Intent ID",
      ];

      const csvRows = data.data.map((payment) => [
        payment.id,
        payment.order?.order_number || "",
        payment.order?.customer?.email || "",
        payment.order?.customer?.full_name || "",
        payment.payment_method,
        payment.amount,
        payment.status,
        format(new Date(payment.created_at), "dd/MM/yyyy HH:mm"),
        payment.processed_at ? format(new Date(payment.processed_at), "dd/MM/yyyy HH:mm") : "",
        payment.transaction_id || "",
        payment.stripe_session_id || "",
        payment.stripe_payment_intent_id || "",
      ]);

      // Create CSV content
      const csvContent = [
        csvHeaders.join(","),
        ...csvRows.map(row => 
          row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        )
      ].join("\n");

      // Create and download file
      const filename = `payments-export-${format(new Date(), "yyyy-MM-dd-HHmm")}.csv`;
      const blob = new Blob(["\uFEFF" + csvContent], { 
        type: "text/csv;charset=utf-8;" 
      });
      
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Xuất báo cáo thành công",
        description: `Đã tải xuống ${data.totalCount} giao dịch (${filename})`,
      });
    },
    onError: (error: Error) => {
      console.error("Export error:", error);
      toast({
        title: "Lỗi xuất báo cáo",
        description: error.message || "Có lỗi xảy ra khi xuất báo cáo",
        variant: "destructive",
      });
    },
  });
}

export type { ExportPaymentsFilters, ExportPaymentsParams }; 