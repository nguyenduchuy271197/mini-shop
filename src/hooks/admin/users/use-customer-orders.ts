"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getCustomerOrders } from "@/actions/admin/users/get-customer-orders";
import { Order, OrderItem, Product } from "@/types/custom.types";

interface CustomerOrderFilters {
  status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

interface UseCustomerOrdersParams {
  customerId: string;
  pagination?: {
    page: number;
    limit: number;
  };
  filters?: CustomerOrderFilters;
  includeItems?: boolean;
}

interface OrderWithItems extends Order {
  order_items?: Array<OrderItem & {
    product?: Pick<Product, "id" | "name" | "slug" | "images"> | null;
  }>;
  items_count?: number;
  total_items_quantity?: number;
}

interface OrdersSummary {
  total_orders: number;
  total_spent: number;
  average_order_value: number;
  orders_by_status: Record<string, number>;
}

interface CustomerOrdersResponse {
  orders: OrderWithItems[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: OrdersSummary;
}

async function getAdminCustomerOrders(params: UseCustomerOrdersParams): Promise<CustomerOrdersResponse> {
  const processedParams = {
    customerId: params.customerId,
    pagination: params.pagination,
    filters: params.filters,
    includeItems: params.includeItems ?? true,
  };

  const result = await getCustomerOrders(processedParams);
  
  if (!result.success) {
    throw new Error(result.error);
  }
  
  return {
    orders: result.orders,
    pagination: result.pagination,
    summary: result.summary,
  };
}

export function useCustomerOrders(params: UseCustomerOrdersParams) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.users.customerOrders(params.customerId),
    queryFn: () => getAdminCustomerOrders(params),
    staleTime: 30 * 1000, // 30 seconds
    retry: 1,
    enabled: !!params.customerId,
  });
}

export type { 
  UseCustomerOrdersParams, 
  CustomerOrderFilters, 
  OrderWithItems, 
  OrdersSummary, 
  CustomerOrdersResponse 
}; 