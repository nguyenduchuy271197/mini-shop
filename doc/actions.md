# Server Actions cho Mini Ecommerce

Dựa vào Functional Requirements và Database Schema, dưới đây là tất cả các server actions cần thiết cho hệ thống mini ecommerce:

## **1. Authentication & User Management Actions**

### **Auth Actions (FR01, FR02, FR04, FR05, FR06)**

```typescript
// auth/register.ts
async function registerUser(
  email: string,
  password: string,
  fullName: string,
  role?: "customer" | "admin"
);

// auth/login.ts
async function loginUser(email: string, password: string);

// auth/logout.ts
async function logoutUser();

// auth/change-password.ts
async function changePassword(currentPassword: string, newPassword: string);

// auth/forgot-password.ts
async function forgotPassword(email: string);

// auth/reset-password.ts
async function resetPassword(token: string, newPassword: string);

// auth/verify-email.ts
async function verifyEmail(token: string);
```

### **Profile Management (FR03, FR08)**

```typescript
// users/update-profile.ts
async function updateUserProfile(profileData: ProfileUpdate);

// users/get-profile.ts
async function getUserProfile(userId?: string);

// users/upload-avatar.ts
async function uploadAvatar(file: File);

// users/get-user-role.ts
async function getUserRole(userId: string);

// users/delete-account.ts
async function deleteUserAccount(userId: string);
```

## **2. Product Management Actions**

### **Product Display (FR07, FR08, FR09, FR10, FR11)**

```typescript
// products/get-products.ts
async function getProducts(
  pagination: PaginationParams,
  filters?: ProductFilters,
  sortBy?: ProductSortOptions
);

// products/get-product-details.ts
async function getProductDetails(productId: number);

// products/get-product-by-slug.ts
async function getProductBySlug(slug: string);

// products/search-products.ts
async function searchProducts(
  query: string,
  filters?: ProductSearchFilters,
  pagination?: PaginationParams
);

// products/filter-products.ts
async function filterProducts(filters: ProductFilters);

// products/get-featured-products.ts
async function getFeaturedProducts(limit?: number);

// products/get-related-products.ts
async function getRelatedProducts(productId: number, limit?: number);
```

### **Category Management**

```typescript
// categories/get-categories.ts
async function getCategories(includeProductCount?: boolean);

// categories/get-category-products.ts
async function getCategoryProducts(
  categoryId: number,
  pagination: PaginationParams,
  filters?: ProductFilters
);

// categories/get-category-by-slug.ts
async function getCategoryBySlug(slug: string);

// categories/get-category-tree.ts
async function getCategoryTree();
```

## **3. Shopping Cart Actions (FR13, FR14, FR15)**

```typescript
// cart/add-to-cart.ts
async function addToCart(productId: number, quantity: number);

// cart/update-cart-item.ts
async function updateCartItem(cartItemId: number, quantity: number);

// cart/remove-from-cart.ts
async function removeFromCart(cartItemId: number);

// cart/get-cart.ts
async function getCart();

// cart/clear-cart.ts
async function clearCart();

// cart/calculate-cart-total.ts
async function calculateCartTotal(couponCode?: string);

// cart/validate-cart.ts
async function validateCartItems();

// cart/merge-guest-cart.ts
async function mergeGuestCart(guestCartItems: CartItem[]);
```

## **4. Order Management Actions**

### **Customer Order Actions (FR16, FR18, FR19, FR20, FR21)**

```typescript
// orders/create-order.ts
async function createOrder(orderData: CreateOrderData);

// orders/get-user-orders.ts
async function getUserOrders(
  userId: string,
  status?: OrderStatus,
  pagination?: PaginationParams
);

// orders/get-order-details.ts
async function getOrderDetails(orderId: number);

// orders/track-order.ts
async function trackOrder(orderNumber: string);

// orders/cancel-order.ts
async function cancelOrder(orderId: number, reason?: string);

// orders/reorder.ts
async function reorderItems(orderId: number);

// orders/update-shipping-address.ts
async function updateOrderShippingAddress(
  orderId: number,
  address: AddressData
);
```

### **Order Processing (Admin)**

```typescript
// orders/update-order-status.ts
async function updateOrderStatus(
  orderId: number,
  status: OrderStatus,
  notes?: string
);

// orders/add-tracking-number.ts
async function addTrackingNumber(orderId: number, trackingNumber: string);

// orders/process-refund.ts
async function processRefund(orderId: number, amount: number, reason: string);

// orders/generate-invoice.ts
async function generateInvoice(orderId: number);

// orders/export-orders.ts
async function exportOrders(filters: OrderFilters, format: "excel" | "csv");
```

## **5. Payment Actions (FR17)**

```typescript
// payments/create-payment.ts
async function createPayment(paymentData: CreatePaymentData);

// payments/process-payment.ts
async function processPayment(paymentId: number, paymentMethod: PaymentMethod);

// payments/verify-payment.ts
async function verifyPayment(transactionId: string, provider: PaymentProvider);

// payments/handle-webhook.ts
async function handlePaymentWebhook(provider: string, payload: any);

// payments/get-payment-status.ts
async function getPaymentStatus(paymentId: number);

// payments/refund-payment.ts
async function refundPayment(paymentId: number, amount: number);

// payments/get-payment-methods.ts
async function getAvailablePaymentMethods();
```

## **6. Address Management (FR24)**

```typescript
// addresses/create-address.ts
async function createAddress(addressData: AddressData);

// addresses/update-address.ts
async function updateAddress(addressId: number, addressData: AddressUpdate);

// addresses/delete-address.ts
async function deleteAddress(addressId: number);

// addresses/get-user-addresses.ts
async function getUserAddresses(userId: string, type?: AddressType);

// addresses/set-default-address.ts
async function setDefaultAddress(addressId: number, type: AddressType);

// addresses/validate-address.ts
async function validateAddress(addressData: AddressData);
```

## **7. Wishlist Actions (FR22)**

```typescript
// wishlist/add-to-wishlist.ts
async function addToWishlist(productId: number);

// wishlist/remove-from-wishlist.ts
async function removeFromWishlist(productId: number);

// wishlist/get-wishlist.ts
async function getWishlist(pagination?: PaginationParams);

// wishlist/check-in-wishlist.ts
async function checkProductInWishlist(productId: number);

// wishlist/clear-wishlist.ts
async function clearWishlist();

// wishlist/move-to-cart.ts
async function moveWishlistItemToCart(productId: number);
```

## **8. Review & Rating Actions (FR23)**

```typescript
// reviews/create-review.ts
async function createReview(reviewData: CreateReviewData);

// reviews/update-review.ts
async function updateReview(reviewId: number, reviewData: ReviewUpdate);

// reviews/delete-review.ts
async function deleteReview(reviewId: number);

// reviews/get-product-reviews.ts
async function getProductReviews(
  productId: number,
  pagination?: PaginationParams,
  sortBy?: ReviewSortOptions
);

// reviews/get-user-reviews.ts
async function getUserReviews(userId: string, pagination?: PaginationParams);

// reviews/vote-helpful.ts
async function voteReviewHelpful(reviewId: number, helpful: boolean);

// reviews/get-review-summary.ts
async function getProductReviewSummary(productId: number);
```

## **9. Admin Management Actions**

### **Product Management (FR25, FR26, FR27)**

```typescript
// admin/products/create-product.ts
async function createProduct(productData: CreateProductData);

// admin/products/update-product.ts
async function updateProduct(productId: number, productData: ProductUpdate);

// admin/products/delete-product.ts
async function deleteProduct(productId: number);

// admin/products/toggle-product-status.ts
async function toggleProductStatus(productId: number, isActive: boolean);

// admin/products/update-stock.ts
async function updateProductStock(productId: number, quantity: number);

// admin/products/bulk-update-products.ts
async function bulkUpdateProducts(
  productIds: number[],
  updateData: BulkProductUpdate
);

// admin/products/upload-product-images.ts
async function uploadProductImages(productId: number, files: File[]);

// admin/products/import-products.ts
async function importProducts(csvFile: File);

// admin/products/export-products.ts
async function exportProducts(filters?: ProductFilters);
```

### **Category Management (FR25)**

```typescript
// admin/categories/create-category.ts
async function createCategory(categoryData: CreateCategoryData);

// admin/categories/update-category.ts
async function updateCategory(categoryId: number, categoryData: CategoryUpdate);

// admin/categories/delete-category.ts
async function deleteCategory(categoryId: number);

// admin/categories/reorder-categories.ts
async function reorderCategories(categoryOrders: CategoryOrder[]);

// admin/categories/upload-category-image.ts
async function uploadCategoryImage(categoryId: number, file: File);
```

### **User Management (FR29)**

```typescript
// admin/users/get-customers.ts
async function getCustomers(
  pagination: PaginationParams,
  filters?: CustomerFilters
);

// admin/users/get-customer-details.ts
async function getCustomerDetails(customerId: string);

// admin/users/update-customer-status.ts
async function updateCustomerStatus(customerId: string, isActive: boolean);

// admin/users/export-customers.ts
async function exportCustomers(filters?: CustomerFilters);

// admin/users/get-customer-orders.ts
async function getCustomerOrders(customerId: string);
```

### **Order Management (FR28)**

```typescript
// admin/orders/get-all-orders.ts
async function getAllOrders(
  pagination: PaginationParams,
  filters?: OrderFilters
);

// admin/orders/get-order-analytics.ts
async function getOrderAnalytics(dateRange: DateRange);

// admin/orders/bulk-update-orders.ts
async function bulkUpdateOrderStatus(orderIds: number[], status: OrderStatus);

// admin/orders/get-pending-orders.ts
async function getPendingOrders();
```

### **Payment Management (FR30)**

```typescript
// admin/payments/get-all-payments.ts
async function getAllPayments(
  pagination: PaginationParams,
  filters?: PaymentFilters
);

// admin/payments/get-payment-analytics.ts
async function getPaymentAnalytics(dateRange: DateRange);

// admin/payments/reconcile-payments.ts
async function reconcilePayments(date: Date);
```

## **10. Reports & Analytics (FR31, FR32, FR33)**

### **Dashboard & Reports**

```typescript
// admin/reports/get-dashboard-stats.ts
async function getDashboardStats();

// admin/reports/get-sales-report.ts
async function getSalesReport(dateRange: DateRange, groupBy?: ReportGroupBy);

// admin/reports/get-product-performance.ts
async function getProductPerformanceReport(
  dateRange: DateRange,
  pagination?: PaginationParams
);

// admin/reports/get-customer-analytics.ts
async function getCustomerAnalytics(dateRange: DateRange);

// admin/reports/get-inventory-report.ts
async function getInventoryReport();

// admin/reports/export-sales-report.ts
async function exportSalesReport(dateRange: DateRange, format: "excel" | "pdf");

// admin/reports/get-best-selling-products.ts
async function getBestSellingProducts(dateRange: DateRange, limit?: number);

// admin/reports/get-revenue-analytics.ts
async function getRevenueAnalytics(dateRange: DateRange);
```

## **11. Coupon & Promotion Management (FR34)**

```typescript
// admin/coupons/create-coupon.ts
async function createCoupon(couponData: CreateCouponData);

// admin/coupons/update-coupon.ts
async function updateCoupon(couponId: number, couponData: CouponUpdate);

// admin/coupons/delete-coupon.ts
async function deleteCoupon(couponId: number);

// admin/coupons/get-coupons.ts
async function getCoupons(pagination?: PaginationParams);

// admin/coupons/validate-coupon.ts
async function validateCoupon(couponCode: string, cartTotal: number);

// admin/coupons/apply-coupon.ts
async function applyCoupon(couponCode: string);

// admin/coupons/get-coupon-usage.ts
async function getCouponUsageReport(couponId: number);
```

## **12. Shipping Management (FR35)**

```typescript
// admin/shipping/create-shipping-zone.ts
async function createShippingZone(zoneData: ShippingZoneData);

// admin/shipping/update-shipping-rates.ts
async function updateShippingRates(zoneId: number, rates: ShippingRateData[]);

// admin/shipping/calculate-shipping.ts
async function calculateShippingCost(address: AddressData, items: CartItem[]);

// admin/shipping/get-shipping-zones.ts
async function getShippingZones();

// admin/shipping/estimate-delivery.ts
async function estimateDeliveryTime(address: AddressData, method: string);
```

## **13. Content Management (FR36, FR38)**

### **Review Management**

```typescript
// admin/reviews/get-all-reviews.ts
async function getAllReviews(
  pagination: PaginationParams,
  filters?: ReviewFilters
);

// admin/reviews/approve-review.ts
async function approveReview(reviewId: number);

// admin/reviews/reject-review.ts
async function rejectReview(reviewId: number, reason?: string);

// admin/reviews/bulk-moderate-reviews.ts
async function bulkModerateReviews(
  reviewIds: number[],
  action: "approve" | "reject"
);
```

### **Banner & Marketing (FR38)**

```typescript
// admin/banners/create-banner.ts
async function createBanner(bannerData: CreateBannerData);

// admin/banners/update-banner.ts
async function updateBanner(bannerId: number, bannerData: BannerUpdate);

// admin/banners/delete-banner.ts
async function deleteBanner(bannerId: number);

// admin/banners/get-banners.ts
async function getBanners(isActive?: boolean);

// admin/banners/reorder-banners.ts
async function reorderBanners(bannerOrders: BannerOrder[]);

// admin/banners/upload-banner-image.ts
async function uploadBannerImage(bannerId: number, file: File);
```

## **14. File Management & Storage**

```typescript
// files/upload-file.ts
async function uploadFile(file: File, bucket: string, path: string);

// files/delete-file.ts
async function deleteFile(filePath: string, bucket: string);

// files/get-file-url.ts
async function getFileUrl(filePath: string, bucket: string);

// files/get-signed-upload-url.ts
async function getSignedUploadUrl(fileName: string, bucket: string);

// files/compress-image.ts
async function compressImage(file: File, quality?: number);
```

## **15. Utilities**

```typescript
// utils/generate-slug.ts
async function generateSlug(text: string, type: "product" | "category");

// utils/validate-sku.ts
async function validateSKU(sku: string, productId?: number);

// utils/sanitize-content.ts
async function sanitizeContent(content: string);

// utils/send-email.ts
async function sendEmail(emailData: EmailData);

// utils/send-sms.ts
async function sendSMS(phoneNumber: string, message: string);
```

## **Tổng cộng: ~120 Server Actions**

Các server actions này được tổ chức theo:

- **Authentication & User Management**: 12 actions
- **Product Management**: 14 actions
- **Shopping Cart**: 8 actions
- **Order Management**: 17 actions
- **Payment**: 7 actions
- **Address Management**: 6 actions
- **Wishlist**: 6 actions
- **Reviews**: 7 actions
- **Admin Product Management**: 9 actions
- **Admin Category Management**: 5 actions
- **Admin User Management**: 5 actions
- **Admin Order Management**: 4 actions
- **Admin Payment Management**: 3 actions
- **Reports & Analytics**: 8 actions
- **Coupon Management**: 7 actions
- **Shipping Management**: 5 actions
- **Content Management**: 10 actions
- **File Management**: 5 actions
- **Utilities**: 5 actions

Tất cả actions đều tuân thủ theo Functional Requirements trong PRD và tương thích với Database Schema đã được định nghĩa.
