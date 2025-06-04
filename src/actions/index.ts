// Auth Actions
export { registerUser } from "./auth/register";
export { loginUser, loginAndRedirect } from "./auth/login";
export { logoutUser, logoutAndRedirect } from "./auth/logout";
export { changePassword } from "./auth/change-password";
export { forgotPassword } from "./auth/forgot-password";
export { 
  resetPassword, 
  resetPasswordAndRedirect, 
  verifyResetToken 
} from "./auth/reset-password";
export { 
  verifyEmail, 
  verifyEmailAndRedirect, 
  resendVerificationEmail, 
  checkEmailVerificationStatus 
} from "./auth/verify-email";

// Profile Management Actions
export { updateUserProfile } from "./users/update-profile";
export { getUserProfile, getUserProfileWithRoles } from "./users/get-profile";
export { uploadAvatar, deleteAvatar } from "./users/upload-avatar";
export { 
  getUserRole, 
  getCurrentUserRole, 
  checkUserHasRole 
} from "./users/get-user-role";
export { 
  deleteUserAccount, 
  deleteOwnAccount, 
  deactivateUser 
} from "./users/delete-account";

// Product Management Actions
export { getProducts } from "./products/get-products";
export { getProductDetails } from "./products/get-product-details";
export { getProductBySlug } from "./products/get-product-by-slug";
export { searchProducts } from "./products/search-products";
export { filterProducts } from "./products/filter-products";
export { getFeaturedProducts } from "./products/get-featured-products";
export { getRelatedProducts } from "./products/get-related-products";

// Category Management Actions
export { getCategories } from "./categories/get-categories";
export { getCategoryProducts } from "./categories/get-category-products";
export { getCategoryBySlug } from "./categories/get-category-by-slug";
export { getCategoryTree } from "./categories/get-category-tree";

// Shopping Cart Actions
export { addToCart } from "./cart/add-to-cart";
export { updateCartItem } from "./cart/update-cart-item";
export { removeFromCart } from "./cart/remove-from-cart";
export { getCart } from "./cart/get-cart";
export { clearCart } from "./cart/clear-cart";
export { calculateCartTotal } from "./cart/calculate-cart-total";
export { validateCart } from "./cart/validate-cart";
export { mergeGuestCart } from "./cart/merge-guest-cart";

// Customer Order Actions
export { createOrder } from "./orders/create-order";
export { getUserOrders } from "./orders/get-user-orders";
export { getOrderDetails } from "./orders/get-order-details";
export { trackOrder } from "./orders/track-order";
export { cancelOrder } from "./orders/cancel-order";
export { reorderItems } from "./orders/reorder";
export { updateOrderShippingAddress } from "./orders/update-shipping-address";

// Order Processing (Admin) Actions
export { updateOrderStatus } from "./orders/update-order-status";
export { addTrackingNumber } from "./orders/add-tracking-number";
export { processRefund } from "./orders/process-refund";
export { generateInvoice } from "./orders/generate-invoice";
export { exportOrders } from "./orders/export-orders";

// Payment Actions (FR17)
export { createPayment } from "./payments/create-payment";
export { processPayment } from "./payments/process-payment";
export { verifyPayment } from "./payments/verify-payment";
export { handlePaymentWebhook } from "./payments/handle-webhook";
export { getPaymentStatus } from "./payments/get-payment-status";
export { refundPayment } from "./payments/refund-payment";
export { getAvailablePaymentMethods, getPaymentMethodDetails, isPaymentMethodAvailable, getRecommendedPaymentMethods } from "./payments/get-payment-methods";

// Address Management Actions (FR24)
export { createAddress } from "./addresses/create-address";
export { updateAddress } from "./addresses/update-address";
export { deleteAddress } from "./addresses/delete-address";
export { getUserAddresses } from "./addresses/get-user-addresses";
export { setDefaultAddress } from "./addresses/set-default-address";
export { validateAddress } from "./addresses/validate-address";

// Wishlist Actions (FR22)
export { addToWishlist } from "./wishlists/add-to-wishlist";
export { removeFromWishlist } from "./wishlists/remove-from-wishlist";
export { getWishlist } from "./wishlists/get-wishlist";
export { checkProductInWishlist } from "./wishlists/check-in-wishlist";
export { clearWishlist } from "./wishlists/clear-wishlist";
export { moveWishlistItemToCart } from "./wishlists/move-to-cart";

// Review & Rating Actions (FR23)
export { createReview } from "./reviews/create-review";
export { updateReview } from "./reviews/update-review";
export { deleteReview } from "./reviews/delete-review";
export { getProductReviews } from "./reviews/get-product-reviews";
export { getUserReviews } from "./reviews/get-user-reviews";
export { voteReviewHelpful } from "./reviews/vote-helpful";
export { getProductReviewSummary } from "./reviews/get-review-summary";

// Admin Product Management Actions (FR25, FR26, FR27)
export { createProduct } from "./admin/products/create-product";
export { updateProduct } from "./admin/products/update-product";
export { deleteProduct } from "./admin/products/delete-product";
export { toggleProductStatus } from "./admin/products/toggle-product-status";
export { updateProductStock } from "./admin/products/update-stock";
export { bulkUpdateProducts } from "./admin/products/bulk-update-products";
export { uploadProductImages } from "./admin/products/upload-product-images";
export { importProductsFromCSV } from "./admin/products/import-products";
export { exportProducts } from "./admin/products/export-products";

// Admin Category Management Actions (FR25)
export { createCategory } from "./admin/categories/create-category";
export { updateCategory } from "./admin/categories/update-category";
export { deleteCategory } from "./admin/categories/delete-category";
export { reorderCategories } from "./admin/categories/reorder-categories";
export { uploadCategoryImage } from "./admin/categories/upload-category-image";

// Admin User Management Actions (FR29)
export { getCustomers } from "./admin/users/get-customers";
export { getCustomerDetails } from "./admin/users/get-customer-details";
export { updateCustomerStatus } from "./admin/users/update-customer-status";
export { exportCustomers } from "./admin/users/export-customers";
export { getCustomerOrders } from "./admin/users/get-customer-orders";

// Admin Order Management Actions (FR28)
export { getAllOrders } from "./admin/orders/get-all-orders";
export { getOrderAnalytics } from "./admin/orders/get-order-analytics";
export { bulkUpdateOrderStatus } from "./admin/orders/bulk-update-orders";
export { getPendingOrders } from "./admin/orders/get-pending-orders";

// Admin Payment Management Actions (FR30)
export { getAllPayments } from "./admin/payments/get-all-payments";
export { getPaymentAnalytics } from "./admin/payments/get-payment-analytics";
export { reconcilePayments } from "./admin/payments/reconcile-payments";

// Admin Coupon Management Actions (FR34)
export { createCoupon } from "./admin/coupons/create-coupon";
export { updateCoupon } from "./admin/coupons/update-coupon";
export { deleteCoupon } from "./admin/coupons/delete-coupon";
export { getCoupons } from "./admin/coupons/get-coupons";
export { validateCoupon } from "./admin/coupons/validate-coupon";
export { applyCoupon } from "./admin/coupons/apply-coupon";
export { getCouponUsageReport } from "./admin/coupons/get-coupon-usage";

// Dashboard & Reports Actions (FR31, FR32, FR33)
export { getDashboardStats } from "./admin/reports/get-dashboard-stats";
export { getSalesReport } from "./admin/reports/get-sales-report";
export { getProductPerformanceReport } from "./admin/reports/get-product-performance";
export { getCustomerAnalytics } from "./admin/reports/get-customer-analytics";
export { getInventoryReport } from "./admin/reports/get-inventory-report";
export { exportSalesReport } from "./admin/reports/export-sales-report";
export { getBestSellingProducts } from "./admin/reports/get-best-selling-products";
export { getRevenueAnalytics } from "./admin/reports/get-revenue-analytics";

// Admin Shipping Management Actions (FR35)
export { createShippingZone } from "./admin/shipping/create-shipping-zone";
export { updateShippingRates } from "./admin/shipping/update-shipping-rates";
export { calculateShippingCost } from "./admin/shipping/calculate-shipping";
export { getShippingZones } from "./admin/shipping/get-shipping-zones";
export { estimateDeliveryTime } from "./admin/shipping/estimate-delivery";

// Admin Review Management Actions (FR36)
export { getAllReviews } from "./admin/reviews/get-all-reviews";
export { approveReview } from "./admin/reviews/approve-review";
export { rejectReview } from "./admin/reviews/reject-review";
export { bulkModerateReviews } from "./admin/reviews/bulk-moderate-reviews";

// Admin Banner Management Actions (FR38)
export { createBanner } from "./admin/banners/create-banner";
export { updateBanner } from "./admin/banners/update-banner";
export { deleteBanner } from "./admin/banners/delete-banner";
export { getBanners } from "./admin/banners/get-banners";
export { reorderBanners } from "./admin/banners/reorder-banners";
export { uploadBannerImage } from "./admin/banners/upload-banner-image";

// File Management & Storage Actions
export { uploadFile } from "./files/upload-file";
export { deleteFile } from "./files/delete-file";
export { getFileUrl } from "./files/get-file-url";
export { getSignedUploadUrl } from "./files/get-signed-upload-url";
export { compressImage } from "./files/compress-image";


export { generateSlug, validateSlugFormat } from "./utils/generate-slug";
export { validateSKU, generateSKUSuggestion, checkSKUAvailability } from "./utils/validate-sku";
export { sanitizeContent } from "./utils/sanitize-content";
export { sendEmail, getEmailStatus } from "./utils/send-email";
export { sendSMS, getSMSStatus, sendBulkSMS } from "./utils/send-sms";



