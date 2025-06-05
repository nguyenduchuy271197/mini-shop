"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserAddresses } from "@/actions/addresses/get-user-addresses";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { AddressType } from "@/types/custom.types";

export interface UseUserAddressesOptions {
  userId?: string;
  type?: AddressType;
}

export function useUserAddresses(options?: UseUserAddressesOptions) {
  return useQuery({
    queryKey: QUERY_KEYS.addresses.userAddresses(options?.userId),
    queryFn: () => getUserAddresses(options),
    enabled: true,
  });
} 