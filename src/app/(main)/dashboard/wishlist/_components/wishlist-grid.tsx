"use client";

import { useEffect, useState } from "react";
import { useWishlist } from "@/hooks/wishlists";
import WishlistEmpty from "./wishlist-empty";
import WishlistCard from "./wishlist-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function WishlistGrid() {
  const { data: wishlistData, isLoading, error } = useWishlist();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return <WishlistGridSkeleton />;
  }

  if (isLoading) {
    return <WishlistGridSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">
          Có lỗi xảy ra khi tải danh sách yêu thích
        </p>
      </div>
    );
  }

  if (!wishlistData?.success) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Không thể tải danh sách yêu thích</p>
      </div>
    );
  }

  const wishlistItems = wishlistData.wishlist || [];

  if (wishlistItems.length === 0) {
    return <WishlistEmpty />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Sản phẩm yêu thích ({wishlistItems.length})
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {wishlistItems.map((item) => (
          <WishlistCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function WishlistGridSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-4">
            <Skeleton className="h-48 w-full rounded" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex space-x-2">
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
