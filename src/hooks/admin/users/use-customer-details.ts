"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getCustomerDetails } from "@/actions/admin/users/get-customer-details";
import { Profile, Order, Address } from "@/types/custom.types";

interface CustomerStatistics {
  total_orders: number;
  total_spent: number;
  average_order_value: number;
  last_order_date?: string;
  first_order_date?: string;
}

interface CustomerActivitySummary {
  items_in_cart: number;
  items_in_wishlist: number;
  reviews_count: number;
}

interface CustomerDetails extends Profile {
  user_role: "customer" | "admin";
  statistics: CustomerStatistics;
  recent_orders: Order[];
  addresses: Address[];
  activity_summary: CustomerActivitySummary;
}

interface UseCustomerDetailsParams {
  customerId: string;
}

async function getAdminCustomerDetails(params: UseCustomerDetailsParams): Promise<CustomerDetails> {
  const result = await getCustomerDetails(params);
  
  if (!result.success) {
    throw new Error(result.error);
  }
  
  return result.customer;
}

export function useCustomerDetails(params: UseCustomerDetailsParams) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.users.customerDetails(params.customerId),
    queryFn: () => getAdminCustomerDetails(params),
    staleTime: 60 * 1000, // 1 minute
    retry: 1,
    enabled: !!params.customerId,
  });
}

export type { 
  UseCustomerDetailsParams, 
  CustomerDetails, 
  CustomerStatistics, 
  CustomerActivitySummary 
}; 