// Wishlist query hooks
export { useWishlist } from "./use-wishlist";
export { useCheckProductInWishlist } from "./use-check-wishlist";

// Wishlist mutation hooks
export { useAddToWishlist } from "./use-add-to-wishlist";
export { useRemoveFromWishlist } from "./use-remove-from-wishlist";
export { useClearWishlist } from "./use-clear-wishlist";
export { useMoveToCart } from "./use-move-to-cart";

// Export types
export type { AddToWishlistData } from "./use-add-to-wishlist";
export type { RemoveFromWishlistData } from "./use-remove-from-wishlist";
export type { ClearWishlistData } from "./use-clear-wishlist";
export type { MoveToCartData } from "./use-move-to-cart"; 