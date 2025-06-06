"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useAddToWishlist,
  useRemoveFromWishlist,
  useCheckProductInWishlist,
} from "@/hooks/wishlists";

interface WishlistButtonProps {
  productId: number;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost";
  className?: string;
  showText?: boolean;
}

export default function WishlistButton({
  productId,
  size = "md",
  variant = "outline",
  className,
  showText = false,
}: WishlistButtonProps) {
  const [mounted, setMounted] = useState(false);

  const { data: wishlistResponse, isLoading: checkingWishlist } =
    useCheckProductInWishlist(productId);
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  // Extract the actual wishlist status from the response
  const isInWishlist =
    wishlistResponse?.success === true && wishlistResponse.inWishlist === true;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Map size to Button component's supported sizes
  const buttonSize = size === "md" ? "default" : size;

  // Get heart icon size based on button size
  const getHeartIconSize = () => {
    switch (size) {
      case "sm":
        return "h-3 w-3";
      case "lg":
        return "h-5 w-5";
      default:
        return "h-4 w-4";
    }
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <Button
        size={buttonSize}
        variant={variant}
        className={cn("px-3", className)}
        disabled
      >
        <Heart className={getHeartIconSize()} />
        {showText && <span className="ml-2">Yêu thích</span>}
      </Button>
    );
  }

  const handleToggleWishlist = () => {
    if (isInWishlist) {
      removeFromWishlist.mutate({ productId });
    } else {
      addToWishlist.mutate({ productId });
    }
  };

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    handleToggleWishlist();
  };

  const isLoading =
    checkingWishlist || addToWishlist.isPending || removeFromWishlist.isPending;

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      size={buttonSize}
      variant={variant}
      className={cn(
        "px-3 transition-colors",
        isInWishlist && "text-red-600 hover:text-red-700",
        className
      )}
    >
      <Heart
        className={cn(
          getHeartIconSize(),
          "transition-all",
          isInWishlist && "fill-current"
        )}
      />
      {showText && (
        <span className="ml-2">
          {isLoading
            ? "Đang xử lý..."
            : isInWishlist
            ? "Đã yêu thích"
            : "Yêu thích"}
        </span>
      )}
    </Button>
  );
}
