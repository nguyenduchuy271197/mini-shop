import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

// Format number with thousand separators
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("vi-VN").format(num);
}

// Format percentage
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// Format date in Vietnamese
export function formatDate(date: string | Date, formatStr: string = "dd/MM/yyyy"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, formatStr, { locale: vi });
}

// Format date for display in charts
export function formatChartDate(date: string): string {
  return format(new Date(date), "dd/MM", { locale: vi });
}

// Calculate growth percentage
export function calculateGrowthPercentage(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// Get growth trend color
export function getGrowthColor(percentage: number): string {
  if (percentage > 0) return "text-green-600";
  if (percentage < 0) return "text-red-600";
  return "text-gray-600";
}

// Format order status to Vietnamese
export function formatOrderStatus(status: string): string {
  const statusMap: Record<string, string> = {
    pending: "Chờ xử lý",
    confirmed: "Đã xác nhận",
    processing: "Đang xử lý",
    shipped: "Đã giao hàng",
    delivered: "Hoàn thành",
    cancelled: "Đã hủy",
    refunded: "Đã hoàn tiền",
  };
  return statusMap[status] || status;
}

// Get status color
export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    processing: "bg-purple-100 text-purple-800",
    shipped: "bg-orange-100 text-orange-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    refunded: "bg-gray-100 text-gray-800",
  };
  return colorMap[status] || "bg-gray-100 text-gray-800";
}
