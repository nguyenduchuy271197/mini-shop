"use client";

import { useQuery } from "@tanstack/react-query";
import { getWishlist } from "@/actions/wishlists/get-wishlist";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { PaginationParams } from "@/types/custom.types";

export function useWishlist(options?: PaginationParams) {
  return useQuery({
    queryKey: QUERY_KEYS.wishlist.list(),
    queryFn: () => getWishlist(options),
    enabled: true,
  });
} 