"use client";

import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClearWishlist } from "@/hooks/wishlists";
import { useToast } from "@/hooks/use-toast";

export default function WishlistHeader() {
  const clearWishlist = useClearWishlist();
  const { toast } = useToast();

  const handleClearWishlist = () => {
    if (
      confirm(
        "Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi danh sách yêu thích?"
      )
    ) {
      clearWishlist.mutate({ confirm: true });
    }
  };

  const handleMoveAllToCart = () => {
    // This would need to be implemented differently as the hook only supports single items
    // For now, show a message
    toast({
      title: "Thông báo",
      description: "Tính năng thêm tất cả vào giỏ hàng sẽ được cập nhật sớm",
    });
  };

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

      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
        <Button
          variant="outline"
          onClick={handleMoveAllToCart}
          className="inline-flex items-center justify-center"
          size="sm"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Thêm tất cả vào giỏ</span>
          <span className="sm:hidden">Thêm tất cả</span>
        </Button>

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
    </div>
  );
}
