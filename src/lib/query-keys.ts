import type { 
  ProductFilters, 
  PaginationParams, 
  AddressData 
} from "@/types/custom.types";

// Filter types
type ReportFilters = {
  start_date?: string;
  end_date?: string;
  category_id?: number;
  product_id?: number;
  user_id?: string;
};

type ShippingData = {
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  destination?: {
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
};

// Base query keys
const authKeys = ["auth"] as const;
const productsKeys = ["products"] as const;
const categoriesKeys = ["categories"] as const;
const cartKeys = ["cart"] as const;
const ordersKeys = ["orders"] as const;
const paymentsKeys = ["payments"] as const;
const addressesKeys = ["addresses"] as const;
const wishlistKeys = ["wishlist"] as const;
const reviewsKeys = ["reviews"] as const;
const adminKeys = ["admin"] as const;
const reportsKeys = ["reports"] as const;
const couponsKeys = ["coupons"] as const;
const shippingKeys = ["shipping"] as const;
const filesKeys = ["files"] as const;
const utilsKeys = ["utils"] as const;

export const QUERY_KEYS = {
  // Auth
  auth: {
    all: authKeys,
    profile: () => [...authKeys, "profile"] as const,
    role: () => [...authKeys, "role"] as const,
    currentUserRole: () => [...authKeys, "current-user-role"] as const,
    emailVerificationStatus: () => [...authKeys, "email-verification-status"] as const,
    resetTokenStatus: () => [...authKeys, "reset-token-status"] as const,
    profileWithRoles: () => [...authKeys, "profile-with-roles"] as const,
    userRole: (userId: string) => [...authKeys, "user-role", userId] as const,
    checkRole: (userId: string, role: string) => [...authKeys, "check-role", userId, role] as const,
  },

  // Products
  products: {
    all: productsKeys,
    lists: () => [...productsKeys, "list"] as const,
    list: (filters?: ProductFilters & PaginationParams) => [...productsKeys, "list", filters] as const,
    details: () => [...productsKeys, "detail"] as const,
    detail: (id: number | string) => [...productsKeys, "detail", id] as const,
    search: (query: string) => [...productsKeys, "search", query] as const,
    featured: () => [...productsKeys, "featured"] as const,
    related: (id: number | string) => [...productsKeys, "related", id] as const,
    bySlug: (slug: string) => [...productsKeys, "slug", slug] as const,
    filter: (filters: ProductFilters) => [...productsKeys, "filter", filters] as const,
  },

  // Categories
  categories: {
    all: categoriesKeys,
    lists: () => [...categoriesKeys, "list"] as const,
    list: () => [...categoriesKeys, "list"] as const,
    details: () => [...categoriesKeys, "detail"] as const,
    detail: (slug: string) => [...categoriesKeys, "detail", slug] as const,
    tree: () => [...categoriesKeys, "tree"] as const,
    products: (slug: string) => [...categoriesKeys, "products", slug] as const,
  },

  // Cart
  cart: {
    all: cartKeys,
    details: () => [...cartKeys, "details"] as const,
    total: () => [...cartKeys, "total"] as const,
    validation: () => [...cartKeys, "validation"] as const,
  },

  // Orders
  orders: {
    all: ordersKeys,
    lists: () => [...ordersKeys, "list"] as const,
    userOrders: (userId?: string) => [...ordersKeys, "list", "user", userId] as const,
    details: () => [...ordersKeys, "detail"] as const,
    detail: (orderId: string) => [...ordersKeys, "detail", orderId] as const,
    tracking: (orderId: string) => [...ordersKeys, "tracking", orderId] as const,
  },

  // Payments
  payments: {
    all: paymentsKeys,
    status: (paymentId: string) => [...paymentsKeys, "status", paymentId] as const,
    methods: () => [...paymentsKeys, "methods"] as const,
  },

  // Addresses
  addresses: {
    all: addressesKeys,
    lists: () => [...addressesKeys, "list"] as const,
    userAddresses: (userId?: string) => [...addressesKeys, "list", "user", userId] as const,
    validation: (addressData: AddressData) => [...addressesKeys, "validation", addressData] as const,
  },

  // Wishlist
  wishlist: {
    all: wishlistKeys,
    list: () => [...wishlistKeys, "list"] as const,
    checkProduct: (productId: number) => [...wishlistKeys, "check", productId] as const,
  },

  // Reviews
  reviews: {
    all: reviewsKeys,
    productReviews: (productId: number) => [...reviewsKeys, "product", productId] as const,
    userReviews: (userId?: string) => [...reviewsKeys, "user", userId] as const,
    summary: (productId: number) => [...reviewsKeys, "summary", productId] as const,
  },

  // Admin
  admin: {
    all: adminKeys,
    // Products
    products: {
      all: [...adminKeys, "products"] as const,
      lists: () => [...adminKeys, "products", "list"] as const,
      list: (filters?: ProductFilters & PaginationParams) => [...adminKeys, "products", "list", filters] as const,
    },
    // Categories
    categories: {
      all: [...adminKeys, "categories"] as const,
      lists: () => [...adminKeys, "categories", "list"] as const,
    },
    // Users/Customers
    users: {
      all: [...adminKeys, "users"] as const,
      customers: () => [...adminKeys, "users", "customers"] as const,
      customerDetails: (customerId: string) => [...adminKeys, "users", "customer", customerId] as const,
      customerOrders: (customerId: string) => [...adminKeys, "users", "customer-orders", customerId] as const,
    },
    // Orders
    orders: {
      all: [...adminKeys, "orders"] as const,
      lists: () => [...adminKeys, "orders", "list"] as const,
      analytics: () => [...adminKeys, "orders", "analytics"] as const,
      pending: () => [...adminKeys, "orders", "pending"] as const,
    },
    // Payments
    payments: {
      all: [...adminKeys, "payments"] as const,
      lists: () => [...adminKeys, "payments", "list"] as const,
      analytics: () => [...adminKeys, "payments", "analytics"] as const,
    },
    // Reviews
    reviews: {
      all: [...adminKeys, "reviews"] as const,
      lists: () => [...adminKeys, "reviews", "list"] as const,
    },
    // Banners
    banners: {
      all: [...adminKeys, "banners"] as const,
      lists: () => [...adminKeys, "banners", "list"] as const,
    },
  },

  // Reports
  reports: {
    all: reportsKeys,
    dashboard: () => [...reportsKeys, "dashboard"] as const,
    sales: (filters?: ReportFilters) => [...reportsKeys, "sales", filters] as const,
    productPerformance: (filters?: ReportFilters) => [...reportsKeys, "product-performance", filters] as const,
    customerAnalytics: (filters?: ReportFilters) => [...reportsKeys, "customer-analytics", filters] as const,
    inventory: () => [...reportsKeys, "inventory"] as const,
    bestSellingProducts: (filters?: ReportFilters) => [...reportsKeys, "best-selling", filters] as const,
    revenue: (filters?: ReportFilters) => [...reportsKeys, "revenue", filters] as const,
  },

  // Coupons
  coupons: {
    all: couponsKeys,
    lists: () => [...couponsKeys, "list"] as const,
    validation: (code: string) => [...couponsKeys, "validation", code] as const,
    usage: (couponId: string) => [...couponsKeys, "usage", couponId] as const,
  },

  // Shipping
  shipping: {
    all: shippingKeys,
    zones: () => [...shippingKeys, "zones"] as const,
    calculation: (data: ShippingData) => [...shippingKeys, "calculation", data] as const,
    delivery: (data: ShippingData) => [...shippingKeys, "delivery", data] as const,
  },

  // Files
  files: {
    all: filesKeys,
    url: (fileId: string) => [...filesKeys, "url", fileId] as const,
    signedUploadUrl: (filename: string) => [...filesKeys, "signed-upload", filename] as const,
  },

  // Utils
  utils: {
    all: utilsKeys,
    slug: (text: string) => [...utilsKeys, "slug", text] as const,
    skuValidation: (sku: string) => [...utilsKeys, "sku-validation", sku] as const,
    sanitize: (content: string) => [...utilsKeys, "sanitize", content] as const,
  },
} as const;
