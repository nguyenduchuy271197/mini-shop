"use client";

import { Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClearWishlist, useWishlist } from "@/hooks/wishlists";

export default function WishlistHeader() {
  const clearWishlist = useClearWishlist();
  const { data: wishlistData } = useWishlist();

  const handleClearWishlist = () => {
    if (
      confirm(
        "Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi danh sách yêu thích?"
      )
    ) {
      clearWishlist.mutate({ confirm: true });
    }
  };

  // Get wishlist items count
  const wishlistItems = wishlistData?.success
    ? wishlistData.wishlist || []
    : [];
  const hasWishlistItems = wishlistItems.length > 0;

  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-red-50 rounded-lg">
          <Heart className="h-6 w-6 text-red-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Danh sách yêu thích
          </h1>
          <p className="text-gray-600 mt-1">
            Quản lý các sản phẩm bạn quan tâm
          </p>
        </div>
      </div>

      {hasWishlistItems && (
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
          <Button
            variant="outline"
            onClick={handleClearWishlist}
            disabled={clearWishlist.isPending}
            className="inline-flex items-center justify-center text-red-600 hover:text-red-700"
            size="sm"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {clearWishlist.isPending ? "Đang xóa..." : "Xóa tất cả"}
          </Button>
        </div>
      )}
    </div>
  );
}
