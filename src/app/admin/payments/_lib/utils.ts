import { PaymentWithDetails } from "@/hooks/admin/payments";
import { formatCurrency } from "@/lib/utils";

// Utility functions cho Payment Management

export function getPaymentStatusBadgeVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "completed":
      return "default";
    case "processing":
      return "secondary";
    case "failed":
    case "cancelled":
      return "destructive";
    case "refunded":
      return "outline";
    default:
      return "outline";
  }
}

export function getPaymentStatusText(status: string): string {
  switch (status) {
    case "pending":
      return "Chờ xử lý";
    case "processing":
      return "Đang xử lý";
    case "completed":
      return "Hoàn thành";
    case "failed":
      return "Thất bại";
    case "cancelled":
      return "Đã hủy";
    case "refunded":
      return "Đã hoàn tiền";
    default:
      return "Không xác định";
  }
}

export function getPaymentMethodText(method: string): string {
  switch (method) {
    case "vnpay":
      return "VNPay";
    case "momo":
      return "MoMo";
    case "cod":
      return "Thanh toán khi nhận hàng";
    case "bank_transfer":
      return "Chuyển khoản ngân hàng";
    default:
      return method;
  }
}

export function getPaymentMethodIcon(method: string): string {
  switch (method) {
    case "vnpay":
      return "💳";
    case "momo":
      return "📱";
    case "cod":
      return "💵";
    case "bank_transfer":
      return "🏦";
    default:
      return "💰";
  }
}

export function formatPaymentDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function calculateSuccessRate(completed: number, total: number): number {
  if (total === 0) return 0;
  return Number(((completed / total) * 100).toFixed(1));
}

export type PaymentMetrics = {
  totalPayments: number;
  totalAmount: number;
  completedPayments: number;
  completedAmount: number;
  pendingPayments: number;
  pendingAmount: number;
  failedPayments: number;
  failedAmount: number;
  successRate: number;
  averagePaymentValue: number;
};

export type PaymentForExport = {
  payment_id: string;
  order_number: string;
  customer_email: string;
  payment_method: string;
  amount: string;
  status: string;
  created_at: string;
  processed_at: string;
  transaction_id: string;
};

export function preparePaymentsForExport(payments: PaymentWithDetails[]): PaymentForExport[] {
  return payments.map((payment) => ({
    payment_id: payment.id.toString(),
    order_number: payment.order?.order_number || "N/A",
    customer_email: payment.order?.customer?.email || "N/A",
    payment_method: getPaymentMethodText(payment.payment_method),
    amount: formatCurrency(payment.amount),
    status: getPaymentStatusText(payment.status),
    created_at: formatPaymentDate(payment.created_at),
    processed_at: payment.processed_at ? formatPaymentDate(payment.processed_at) : "Chưa xử lý",
    transaction_id: payment.transaction_id || "N/A",
  }));
}

export function getReconciliationSeverityColor(severity: "low" | "medium" | "high"): string {
  switch (severity) {
    case "high":
      return "text-red-600 bg-red-50 border-red-200";
    case "medium":
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "low":
      return "text-blue-600 bg-blue-50 border-blue-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
}

export function getReconciliationSeverityText(severity: "low" | "medium" | "high"): string {
  switch (severity) {
    case "high":
      return "Nghiêm trọng";
    case "medium":
      return "Trung bình";
    case "low":
      return "Thấp";
    default:
      return "Không xác định";
  }
}

export function getReconciliationTypeText(type: string): string {
  switch (type) {
    case "amount_mismatch":
      return "Số tiền không khớp";
    case "status_mismatch":
      return "Trạng thái không khớp";
    case "missing_payment":
      return "Thiếu thanh toán";
    case "duplicate_payment":
      return "Thanh toán trùng lặp";
    case "orphan_payment":
      return "Thanh toán mồ côi";
    default:
      return type;
  }
} 