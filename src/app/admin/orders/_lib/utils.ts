import { formatCurrency } from "@/lib/utils";

/**
 * Format date for Vietnamese locale
 */
export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  return new Intl.DateTimeFormat("vi-VN", { ...defaultOptions, ...options }).format(
    new Date(dateString)
  );
}

/**
 * Get order status display configuration
 */
export function getOrderStatusConfig(status: string) {
  const statusConfigs = {
    pending: {
      label: "Chờ xử lý",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      variant: "secondary" as const,
    },
    confirmed: {
      label: "Đã xác nhận",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      variant: "outline" as const,
    },
    processing: {
      label: "Đang xử lý",
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      variant: "default" as const,
    },
    shipped: {
      label: "Đã giao vận",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      variant: "outline" as const,
    },
    delivered: {
      label: "Đã giao hàng",
      color: "text-green-600",
      bgColor: "bg-green-100",
      variant: "default" as const,
    },
    cancelled: {
      label: "Đã hủy",
      color: "text-red-600",
      bgColor: "bg-red-100",
      variant: "destructive" as const,
    },
    refunded: {
      label: "Đã hoàn tiền",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      variant: "outline" as const,
    },
  };

  return statusConfigs[status as keyof typeof statusConfigs] || statusConfigs.pending;
}

/**
 * Get payment status display configuration
 */
export function getPaymentStatusConfig(status: string) {
  const paymentConfigs = {
    pending: {
      label: "Chờ thanh toán",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      variant: "secondary" as const,
    },
    paid: {
      label: "Đã thanh toán",
      color: "text-green-600",
      bgColor: "bg-green-100",
      variant: "default" as const,
    },
    failed: {
      label: "Thất bại",
      color: "text-red-600",
      bgColor: "bg-red-100",
      variant: "destructive" as const,
    },
    refunded: {
      label: "Đã hoàn tiền",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      variant: "outline" as const,
    },
  };

  return paymentConfigs[status as keyof typeof paymentConfigs] || paymentConfigs.pending;
}

/**
 * Calculate order metrics
 */
type OrderMetrics = {
  id: number;
  status: string;
  payment_status: string;
  total_amount: number;
};

export function calculateOrderMetrics(orders: OrderMetrics[]) {
  const total = orders.length;
  const totalValue = orders.reduce((sum, order) => sum + order.total_amount, 0);
  const averageValue = total > 0 ? totalValue / total : 0;

  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const paymentStatusCounts = orders.reduce((acc, order) => {
    acc[order.payment_status] = (acc[order.payment_status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total,
    totalValue,
    averageValue,
    statusCounts,
    paymentStatusCounts,
  };
}

/**
 * Export orders data to CSV format
 */
type OrderForExport = {
  order_number: string;
  customer?: {
    full_name?: string;
    email?: string;
  };
  status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
};

export function exportOrdersToCSV(orders: OrderForExport[]): string {
  const headers = [
    "Mã đơn hàng",
    "Khách hàng",
    "Email",
    "Trạng thái",
    "Thanh toán",
    "Tổng tiền",
    "Ngày tạo",
    "Ngày cập nhật",
  ];

  const rows = orders.map((order) => [
    order.order_number,
    order.customer?.full_name || "Khách vãng lai",
    order.customer?.email || "",
    getOrderStatusConfig(order.status).label,
    getPaymentStatusConfig(order.payment_status).label,
    formatCurrency(order.total_amount),
    formatDate(order.created_at),
    formatDate(order.updated_at),
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((field) => `"${field}"`).join(","))
    .join("\n");

  return csvContent;
}

/**
 * Download data as file
 */
export function downloadFile(content: string, filename: string, mimeType: string = "text/csv") {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
} 