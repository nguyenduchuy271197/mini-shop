# React Query Setup cho Mini Ecommerce

Dựa vào server actions và database schema, dưới đây là cấu trúc React Query setup hoàn chỉnh:

## 🚀 Cài đặt

```bash
pnpm add @tanstack/react-query @tanstack/react-query-devtools
```

## 📁 Cấu trúc thư mục

| Thư mục                         | File                          | Mô tả                               |
| ------------------------------- | ----------------------------- | ----------------------------------- |
| **src/lib/**                    |                               |                                     |
|                                 | query-client.ts               | QueryClient configuration           |
|                                 | query-keys.ts                 | Query keys definitions              |
| **src/components/providers/**   |                               |                                     |
|                                 | query-provider.tsx            | QueryProvider wrapper               |
| **src/hooks/auth/**             |                               |                                     |
|                                 | use-register.ts               | registerUser action                 |
|                                 | use-login.ts                  | loginUser action                    |
|                                 | use-logout.ts                 | logoutUser action                   |
|                                 | use-change-password.ts        | changePassword action               |
|                                 | use-forgot-password.ts        | forgotPassword action               |
|                                 | use-reset-password.ts         | resetPassword action                |
|                                 | use-verify-email.ts           | verifyEmail action                  |
|                                 | index.ts                      | export all auth hooks               |
| **src/hooks/users/**            |                               |                                     |
|                                 | use-profile.ts                | getUserProfile action               |
|                                 | use-update-profile.ts         | updateUserProfile action            |
|                                 | use-upload-avatar.ts          | uploadAvatar action                 |
|                                 | use-user-role.ts              | getUserRole action                  |
|                                 | use-delete-account.ts         | deleteUserAccount action            |
|                                 | index.ts                      | export all user hooks               |
| **src/hooks/products/**         |                               |                                     |
|                                 | use-products.ts               | getProducts action                  |
|                                 | use-product.ts                | getProductDetails, getProductBySlug |
|                                 | use-search-products.ts        | searchProducts action               |
|                                 | use-filter-products.ts        | filterProducts action               |
|                                 | use-featured-products.ts      | getFeaturedProducts action          |
|                                 | use-related-products.ts       | getRelatedProducts action           |
|                                 | index.ts                      | export all product hooks            |
| **src/hooks/categories/**       |                               |                                     |
|                                 | use-categories.ts             | getCategories action                |
|                                 | use-category.ts               | getCategoryBySlug action            |
|                                 | use-category-products.ts      | getCategoryProducts action          |
|                                 | use-category-tree.ts          | getCategoryTree action              |
|                                 | index.ts                      | export all category hooks           |
| **src/hooks/cart/**             |                               |                                     |
|                                 | use-cart.ts                   | getCart action                      |
|                                 | use-add-to-cart.ts            | addToCart action                    |
|                                 | use-update-cart-item.ts       | updateCartItem action               |
|                                 | use-remove-from-cart.ts       | removeFromCart action               |
|                                 | use-clear-cart.ts             | clearCart action                    |
|                                 | use-cart-total.ts             | calculateCartTotal action           |
|                                 | use-validate-cart.ts          | validateCartItems action            |
|                                 | use-merge-guest-cart.ts       | mergeGuestCart action               |
|                                 | index.ts                      | export all cart hooks               |
| **src/hooks/orders/**           |                               |                                     |
|                                 | use-create-order.ts           | createOrder action                  |
|                                 | use-user-orders.ts            | getUserOrders action                |
|                                 | use-order.ts                  | getOrderDetails action              |
|                                 | use-track-order.ts            | trackOrder action                   |
|                                 | use-cancel-order.ts           | cancelOrder action                  |
|                                 | use-reorder.ts                | reorderItems action                 |
|                                 | use-update-shipping.ts        | updateOrderShippingAddress action   |
|                                 | index.ts                      | export all order hooks              |
| **src/hooks/payments/**         |                               |                                     |
|                                 | use-create-payment.ts         | createPayment action                |
|                                 | use-process-payment.ts        | processPayment action               |
|                                 | use-verify-payment.ts         | verifyPayment action                |
|                                 | use-payment-status.ts         | getPaymentStatus action             |
|                                 | use-refund-payment.ts         | refundPayment action                |
|                                 | use-payment-methods.ts        | getAvailablePaymentMethods action   |
|                                 | index.ts                      | export all payment hooks            |
| **src/hooks/addresses/**        |                               |                                     |
|                                 | use-addresses.ts              | getUserAddresses action             |
|                                 | use-create-address.ts         | createAddress action                |
|                                 | use-update-address.ts         | updateAddress action                |
|                                 | use-delete-address.ts         | deleteAddress action                |
|                                 | use-set-default-address.ts    | setDefaultAddress action            |
|                                 | use-validate-address.ts       | validateAddress action              |
|                                 | index.ts                      | export all address hooks            |
| **src/hooks/wishlist/**         |                               |                                     |
|                                 | use-wishlist.ts               | getWishlist action                  |
|                                 | use-add-to-wishlist.ts        | addToWishlist action                |
|                                 | use-remove-from-wishlist.ts   | removeFromWishlist action           |
|                                 | use-check-in-wishlist.ts      | checkProductInWishlist action       |
|                                 | use-clear-wishlist.ts         | clearWishlist action                |
|                                 | use-move-to-cart.ts           | moveWishlistItemToCart action       |
|                                 | index.ts                      | export all wishlist hooks           |
| **src/hooks/reviews/**          |                               |                                     |
|                                 | use-create-review.ts          | createReview action                 |
|                                 | use-update-review.ts          | updateReview action                 |
|                                 | use-delete-review.ts          | deleteReview action                 |
|                                 | use-product-reviews.ts        | getProductReviews action            |
|                                 | use-user-reviews.ts           | getUserReviews action               |
|                                 | use-vote-helpful.ts           | voteReviewHelpful action            |
|                                 | use-review-summary.ts         | getProductReviewSummary action      |
|                                 | index.ts                      | export all review hooks             |
| **src/hooks/admin/products/**   |                               |                                     |
|                                 | use-create-product.ts         | createProduct action                |
|                                 | use-update-product.ts         | updateProduct action                |
|                                 | use-delete-product.ts         | deleteProduct action                |
|                                 | use-toggle-product-status.ts  | toggleProductStatus action          |
|                                 | use-update-stock.ts           | updateProductStock action           |
|                                 | use-bulk-update-products.ts   | bulkUpdateProducts action           |
|                                 | use-upload-product-images.ts  | uploadProductImages action          |
|                                 | use-import-products.ts        | importProducts action               |
|                                 | use-export-products.ts        | exportProducts action               |
|                                 | index.ts                      | export all admin product hooks      |
| **src/hooks/admin/categories/** |                               |                                     |
|                                 | use-create-category.ts        | createCategory action               |
|                                 | use-update-category.ts        | updateCategory action               |
|                                 | use-delete-category.ts        | deleteCategory action               |
|                                 | use-reorder-categories.ts     | reorderCategories action            |
|                                 | use-upload-category-image.ts  | uploadCategoryImage action          |
|                                 | index.ts                      | export all admin category hooks     |
| **src/hooks/admin/users/**      |                               |                                     |
|                                 | use-customers.ts              | getCustomers action                 |
|                                 | use-customer-details.ts       | getCustomerDetails action           |
|                                 | use-update-customer-status.ts | updateCustomerStatus action         |
|                                 | use-export-customers.ts       | exportCustomers action              |
|                                 | use-customer-orders.ts        | getCustomerOrders action            |
|                                 | index.ts                      | export all admin user hooks         |
| **src/hooks/admin/orders/**     |                               |                                     |
|                                 | use-all-orders.ts             | getAllOrders action                 |
|                                 | use-order-analytics.ts        | getOrderAnalytics action            |
|                                 | use-bulk-update-orders.ts     | bulkUpdateOrderStatus action        |
|                                 | use-pending-orders.ts         | getPendingOrders action             |
|                                 | use-update-order-status.ts    | updateOrderStatus action            |
|                                 | use-add-tracking.ts           | addTrackingNumber action            |
|                                 | use-process-refund.ts         | processRefund action                |
|                                 | use-generate-invoice.ts       | generateInvoice action              |
|                                 | use-export-orders.ts          | exportOrders action                 |
|                                 | index.ts                      | export all admin order hooks        |
| **src/hooks/admin/payments/**   |                               |                                     |
|                                 | use-all-payments.ts           | getAllPayments action               |
|                                 | use-payment-analytics.ts      | getPaymentAnalytics action          |
|                                 | use-reconcile-payments.ts     | reconcilePayments action            |
|                                 | index.ts                      | export all admin payment hooks      |
| **src/hooks/admin/reviews/**    |                               |                                     |
|                                 | use-all-reviews.ts            | getAllReviews action                |
|                                 | use-approve-review.ts         | approveReview action                |
|                                 | use-reject-review.ts          | rejectReview action                 |
|                                 | use-bulk-moderate-reviews.ts  | bulkModerateReviews action          |
|                                 | index.ts                      | export all admin review hooks       |
| **src/hooks/admin/banners/**    |                               |                                     |
|                                 | use-banners.ts                | getBanners action                   |
|                                 | use-create-banner.ts          | createBanner action                 |
|                                 | use-update-banner.ts          | updateBanner action                 |
|                                 | use-delete-banner.ts          | deleteBanner action                 |
|                                 | use-reorder-banners.ts        | reorderBanners action               |
|                                 | use-upload-banner-image.ts    | uploadBannerImage action            |
|                                 | index.ts                      | export all admin banner hooks       |
| **src/hooks/reports/**          |                               |                                     |
|                                 | use-dashboard-stats.ts        | getDashboardStats action            |
|                                 | use-sales-report.ts           | getSalesReport action               |
|                                 | use-product-performance.ts    | getProductPerformanceReport action  |
|                                 | use-customer-analytics.ts     | getCustomerAnalytics action         |
|                                 | use-inventory-report.ts       | getInventoryReport action           |
|                                 | use-export-sales-report.ts    | exportSalesReport action            |
|                                 | use-best-selling-products.ts  | getBestSellingProducts action       |
|                                 | use-revenue-analytics.ts      | getRevenueAnalytics action          |
|                                 | index.ts                      | export all report hooks             |
| **src/hooks/coupons/**          |                               |                                     |
|                                 | use-coupons.ts                | getCoupons action                   |
|                                 | use-create-coupon.ts          | createCoupon action                 |
|                                 | use-update-coupon.ts          | updateCoupon action                 |
|                                 | use-delete-coupon.ts          | deleteCoupon action                 |
|                                 | use-validate-coupon.ts        | validateCoupon action               |
|                                 | use-apply-coupon.ts           | applyCoupon action                  |
|                                 | use-coupon-usage.ts           | getCouponUsageReport action         |
|                                 | index.ts                      | export all coupon hooks             |
| **src/hooks/shipping/**         |                               |                                     |
|                                 | use-shipping-zones.ts         | getShippingZones action             |
|                                 | use-create-shipping-zone.ts   | createShippingZone action           |
|                                 | use-update-shipping-rates.ts  | updateShippingRates action          |
|                                 | use-calculate-shipping.ts     | calculateShippingCost action        |
|                                 | use-estimate-delivery.ts      | estimateDeliveryTime action         |
|                                 | index.ts                      | export all shipping hooks           |
| **src/hooks/files/**            |                               |                                     |
|                                 | use-upload-file.ts            | uploadFile action                   |
|                                 | use-delete-file.ts            | deleteFile action                   |
|                                 | use-file-url.ts               | getFileUrl action                   |
|                                 | use-signed-upload-url.ts      | getSignedUploadUrl action           |
|                                 | use-compress-image.ts         | compressImage action                |
|                                 | index.ts                      | export all file hooks               |
| **src/hooks/utils/**            |                               |                                     |
|                                 | use-generate-slug.ts          | generateSlug action                 |
|                                 | use-validate-sku.ts           | validateSKU action                  |
|                                 | use-sanitize-content.ts       | sanitizeContent action              |
|                                 | use-send-email.ts             | sendEmail action                    |
|                                 | use-send-sms.ts               | sendSMS action                      |
|                                 | index.ts                      | export all utility hooks            |
| **src/hooks/**                  |                               |                                     |
|                                 | index.ts                      | export all hooks by category        |

## ⚙️ Cấu hình cơ bản

### 1. QueryClient Configuration (`src/lib/query-client.ts`)

```typescript
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 30, // 30 phút
      gcTime: 1000 * 60 * 60, // 1 giờ
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: 1,
      networkMode: "online",
    },
  },
});
```

### 2. QueryProvider Setup (`src/components/providers/query-provider.tsx`)

```typescript
"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/lib/query-client";

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      )}
    </QueryClientProvider>
  );
}
```

### 3. Layout Integration (`src/app/layout.tsx`)

```typescript
import { QueryProvider } from "@/components/providers/query-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
```

## 🔑 Query Keys Convention (`src/lib/query-keys.ts`)

```typescript
export const QUERY_KEYS = {
  // Auth
  auth: {
    all: ["auth"] as const,
    profile: () => [...QUERY_KEYS.auth.all, "profile"] as const,
    role: () => [...QUERY_KEYS.auth.all, "role"] as const,
  },

  // Products
  products: {
    all: ["products"] as const,
    lists: () => [...QUERY_KEYS.products.all, "list"] as const,
    list: (filters?: any) => [...QUERY_KEYS.products.lists(), filters] as const,
    details: () => [...QUERY_KEYS.products.all, "detail"] as const,
    detail: (id: number | string) =>
      [...QUERY_KEYS.products.details(), id] as const,
    search: (query: string) =>
      [...QUERY_KEYS.products.all, "search", query] as const,
    featured: () => [...QUERY_KEYS.products.all, "featured"] as const,
    related: (id: number | string) =>
      [...QUERY_KEYS.products.all, "related", id] as const,
    bySlug: (slug: string) =>
      [...QUERY_KEYS.products.all, "slug", slug] as const,
  },

  // Cart, Orders, etc...
} as const;
```

## 📝 Quy tắc đặt tên hooks:

### 1. Query hooks (GET operations):

- `use-{entity}` hoặc `use-{entities}` cho việc lấy dữ liệu
- Ví dụ: `use-products`, `use-product`, `use-categories`

### 2. Mutation hooks (POST, PUT, DELETE operations):

- `use-{action}-{entity}` cho các thao tác thay đổi dữ liệu
- Ví dụ: `use-create-product`, `use-update-order`, `use-delete-review`

### 3. Special hooks:

- `use-{specific-action}` cho các thao tác đặc biệt
- Ví dụ: `use-login`, `use-logout`, `use-track-order`

## 🧩 Hooks Implementation Examples:

### Query Hook (use-products.ts):

```typescript
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/actions/products/get-products";

export function useProducts(
  pagination: PaginationParams,
  filters?: ProductFilters,
  sortBy?: ProductSortOptions
) {
  return useQuery({
    queryKey: ["products", pagination, filters, sortBy],
    queryFn: () => getProducts(pagination, filters, sortBy),
    enabled: true,
  });
}
```

### Mutation Hook (use-add-to-cart.ts):

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addToCart } from "@/actions/cart/add-to-cart";

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      quantity,
    }: {
      productId: number;
      quantity: number;
    }) => addToCart(productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}
```

### Infinite Query Hook (use-infinite-products.ts):

```typescript
import { useInfiniteQuery } from "@tanstack/react-query";
import { getProducts } from "@/actions/products/get-products";

export function useInfiniteProducts(
  filters?: ProductFilters,
  sortBy?: ProductSortOptions
) {
  return useInfiniteQuery({
    queryKey: ["products", "infinite", filters, sortBy],
    queryFn: ({ pageParam = 1 }) =>
      getProducts({ page: pageParam, limit: 12 }, filters, sortBy),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasNextPage ? allPages.length + 1 : undefined;
    },
  });
}
```

## 🎯 Lợi ích của cấu trúc này:

- **🗂️ Tổ chức code rõ ràng** theo từng domain
- **🔧 Dễ bảo trì** và mở rộng
- **⚡ Tối ưu caching** với React Query
- **🔒 Type safety** với TypeScript
- **♻️ Reusable** và **consistent** naming convention
- **🚀 Performance** với stale-while-revalidate strategy
- **🐛 Debug dễ dàng** với React Query Devtools

## 🔄 Sử dụng Hooks

### Trong Components:

```typescript
"use client";

import { useProducts } from "@/hooks/products";
import { useAddToCart } from "@/hooks/cart";

export function ProductList() {
  const {
    data: products,
    isLoading,
    error,
  } = useProducts({
    page: 1,
    limit: 12,
  });

  const addToCartMutation = useAddToCart();

  const handleAddToCart = (productId: number) => {
    addToCartMutation.mutate({
      productId,
      quantity: 1,
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {products?.map((product) => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <button
            onClick={() => handleAddToCart(product.id)}
            disabled={addToCartMutation.isPending}
          >
            {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      ))}
    </div>
  );
}
```

## 📚 Next Steps

1.  Cài đặt và cấu hình React Query
2.  Tạo cấu trúc thư mục hooks
3.  Setup QueryProvider
4.  Implement server actions
5.  Tạo hooks cho các domain
6.  Add error boundaries
7.  Implement offline support
8.  Add loading states và optimistic updates
