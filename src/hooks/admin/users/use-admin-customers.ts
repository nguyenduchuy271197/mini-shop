"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getCustomers } from "@/actions/admin/users/get-customers";
import { Profile } from "@/types/custom.types";

interface CustomerFilters {
  search?: string;
  isActive?: boolean;
  gender?: "male" | "female" | "other";
  hasOrders?: boolean;
  registeredAfter?: string;
  registeredBefore?: string;
}

interface UseAdminCustomersParams {
  pagination: {
    page: number;
    limit: number;
  };
  filters?: CustomerFilters;
}

interface CustomerInfo extends Profile {
  total_orders?: number;
  total_spent?: number;
  last_order_date?: string;
  user_role?: "customer" | "admin";
}

interface AdminCustomersResponse {
  customers: CustomerInfo[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

async function getAdminCustomers(params: UseAdminCustomersParams): Promise<AdminCustomersResponse> {
  const result = await getCustomers(params);
  
  if (!result.success) {
    throw new Error(result.error);
  }
  
  return {
    customers: result.customers,
    pagination: result.pagination,
  };
}

export function useAdminCustomers(params: UseAdminCustomersParams) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.users.customers(),
    queryFn: () => getAdminCustomers(params),
    staleTime: 30 * 1000, // 30 seconds
    retry: 1,
  });
}

export type { UseAdminCustomersParams, CustomerFilters, CustomerInfo, AdminCustomersResponse }; 