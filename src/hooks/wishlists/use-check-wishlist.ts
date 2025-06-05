"use client";

import { useQuery } from "@tanstack/react-query";
import { checkProductInWishlist } from "@/actions/wishlists/check-in-wishlist";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useCheckProductInWishlist(productId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.wishlist.checkProduct(productId),
    queryFn: () => checkProductInWishlist({ productId }),
    enabled: !!productId && productId > 0,
  });
} 