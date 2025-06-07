import { CustomerInfo } from "@/hooks/admin/users";
import { formatCurrency } from "@/lib/utils";

// Utility functions cho Customer Management

export function getCustomerStatusBadgeVariant(
  totalOrders: number
): "default" | "secondary" | "destructive" | "outline" {
  if (totalOrders === 0) return "outline";
  if (totalOrders >= 10) return "default";
  if (totalOrders >= 5) return "secondary";
  return "outline";
}

export function getCustomerStatusText(totalOrders: number): string {
  if (totalOrders === 0) return "Chưa có đơn hàng";
  if (totalOrders >= 20) return "Khách hàng VIP";
  if (totalOrders >= 10) return "Khách hàng thân thiết";
  if (totalOrders >= 5) return "Khách hàng thường xuyên";
  return "Khách hàng mới";
}

export function formatCustomerJoinDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getGenderDisplayText(gender?: string | null): string {
  switch (gender) {
    case "male":
      return "Nam";
    case "female":
      return "Nữ";
    case "other":
      return "Khác";
    default:
      return "Chưa cập nhật";
  }
}

export function calculateCustomerLifetimeValue(totalSpent?: number): {
  value: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
} {
  const spent = totalSpent || 0;
  const formattedValue = formatCurrency(spent);

  let tier: "bronze" | "silver" | "gold" | "platinum" = "bronze";
  if (spent >= 50000000) tier = "platinum"; // 50M
  else if (spent >= 20000000) tier = "gold"; // 20M
  else if (spent >= 5000000) tier = "silver"; // 5M

  return { value: formattedValue, tier };
}

export type CustomerMetrics = {
  totalCustomers: number;
  newCustomersThisMonth: number;
  activeCustomers: number;
  vipCustomers: number;
  averageOrderValue: number;
  customerRetentionRate: number;
};

export type CustomerForExport = {
  full_name: string;
  email: string;
  phone: string;
  gender: string;
  created_at: string;
  total_orders: number;
  total_spent: string;
  last_order_date: string;
  status: string;
};

export function prepareCustomersForExport(customers: CustomerInfo[]): CustomerForExport[] {
  return customers.map((customer) => ({
    full_name: customer.full_name || "Chưa cập nhật",
    email: customer.email,
    phone: customer.phone || "Chưa cập nhật",
    gender: getGenderDisplayText(customer.gender),
    created_at: formatCustomerJoinDate(customer.created_at),
    total_orders: customer.total_orders || 0,
    total_spent: formatCurrency(customer.total_spent || 0),
    last_order_date: customer.last_order_date 
      ? formatCustomerJoinDate(customer.last_order_date)
      : "Chưa có đơn hàng",
    status: getCustomerStatusText(customer.total_orders || 0),
  }));
} 