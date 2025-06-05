"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getAllOrders } from "@/actions/admin/orders/get-all-orders";
import { Order, OrderItem, Product, Profile } from "@/types/custom.types";

interface OrderFilters {
  status?: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
  paymentStatus?: "pending" | "paid" | "failed" | "refunded";
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  customerId?: string;
  shippingMethod?: string;
}

interface UseAdminOrdersParams {
  pagination: {
    page: number;
    limit: number;
  };
  filters?: OrderFilters;
  includeItems?: boolean;
  includeCustomer?: boolean;
}

interface OrderItemWithProduct extends OrderItem {
  product: Pick<Product, "id" | "name" | "slug" | "images"> | null;
}

interface OrderWithDetails extends Order {
  customer?: Pick<Profile, "id" | "full_name" | "email" | "phone"> | null;
  order_items?: OrderItemWithProduct[];
  items_count?: number;
  total_items_quantity?: number;
}

interface AdminOrdersResponse {
  success: true;
  orders: OrderWithDetails[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    total_orders: number;
    total_revenue: number;
    average_order_value: number;
    orders_by_status: Record<string, number>;
    orders_by_payment_status: Record<string, number>;
  };
}

export function useAdminOrders(params: UseAdminOrdersParams) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.orders.list(params),
    queryFn: async () => {
      const result = await getAllOrders({
        pagination: params.pagination,
        filters: params.filters,
        includeItems: params.includeItems ?? false,
        includeCustomer: params.includeCustomer ?? true,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as AdminOrdersResponse;
    },
    enabled: !!params.pagination,
    retry: (failureCount, error) => {
      // Don't retry on authorization errors
      if (error.message.includes("không có quyền") || error.message.includes("đăng nhập")) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export type { OrderFilters, UseAdminOrdersParams, OrderWithDetails, OrderItemWithProduct, AdminOrdersResponse }; 