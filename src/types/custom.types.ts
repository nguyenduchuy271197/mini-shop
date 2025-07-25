import { Database } from "./database.types";

export type Row<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertDto<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateDto<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// Core Ecommerce Types
export type Profile = Row<"profiles">;
export type ProfileInsertDto = InsertDto<"profiles">;
export type ProfileUpdateDto = UpdateDto<"profiles">;

export type Category = Row<"categories">;
export type CategoryInsertDto = InsertDto<"categories">;
export type CategoryUpdateDto = UpdateDto<"categories">;

export type Product = Row<"products">;
export type ProductInsertDto = InsertDto<"products">;
export type ProductUpdateDto = UpdateDto<"products">;

export type CartItem = Row<"cart_items">;
export type CartItemInsertDto = InsertDto<"cart_items">;
export type CartItemUpdateDto = UpdateDto<"cart_items">;

export type Order = Row<"orders">;
export type OrderInsertDto = InsertDto<"orders">;
export type OrderUpdateDto = UpdateDto<"orders">;

export type OrderItem = Row<"order_items">;
export type OrderItemInsertDto = InsertDto<"order_items">;
export type OrderItemUpdateDto = UpdateDto<"order_items">;

export type Address = Row<"addresses">;
export type AddressInsertDto = InsertDto<"addresses">;
export type AddressUpdateDto = UpdateDto<"addresses">;

export type Payment = Row<"payments">;
export type PaymentInsertDto = InsertDto<"payments">;
export type PaymentUpdateDto = UpdateDto<"payments">;

export type Review = Row<"reviews">;
export type ReviewInsertDto = InsertDto<"reviews">;
export type ReviewUpdateDto = UpdateDto<"reviews">;

export type Wishlist = Row<"wishlists">;
export type WishlistInsertDto = InsertDto<"wishlists">;
export type WishlistUpdateDto = UpdateDto<"wishlists">;

export type Coupon = Row<"coupons">;
export type CouponInsertDto = InsertDto<"coupons">;
export type CouponUpdateDto = UpdateDto<"coupons">;

export type UserRole = Row<"user_roles">;
export type UserRoleInsertDto = InsertDto<"user_roles">;
export type UserRoleUpdateDto = UpdateDto<"user_roles">;

export type RolePermission = Row<"role_permissions">;
export type RolePermissionInsertDto = InsertDto<"role_permissions">;
export type RolePermissionUpdateDto = UpdateDto<"role_permissions">;

// Enum types based on database schema
export type AppRole = Database["public"]["Enums"]["app_role"];
export type AppPermission = Database["public"]["Enums"]["app_permission"];
export type GenderType = Database["public"]["Enums"]["gender_type"];

// Order status types from database schema
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

// Payment method types
export type PaymentMethod = 'vnpay' | 'cod' | 'stripe';

// Address type based on database schema
export type AddressType = 'shipping' | 'billing';

// Address data for order creation
export type AddressData = {
  first_name: string;
  last_name: string;
  company?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
};

// Stripe-specific types
export type StripeCheckoutData = {
  orderId: number;
  amount: number;
  currency: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
};

export type StripeSessionResponse = {
  sessionId: string;
  url: string;
};

export type CreatePaymentData = {
  order_id: number;
  payment_method: PaymentMethod;
  amount: number;
  currency?: string;
  stripe_session_id?: string;
  stripe_payment_intent_id?: string;
};

// Pagination params
export type PaginationParams = {
  page: number;
  limit: number;
};

// Product filters
export type ProductFilters = {
  category_id?: number;
  categoryId?: number; // For compatibility with hooks
  min_price?: number;
  minPrice?: number; // For compatibility with hooks
  max_price?: number;
  maxPrice?: number; // For compatibility with hooks
  brand?: string;
  tags?: string[];
  is_featured?: boolean;
  inStock?: boolean; // For compatibility with hooks
  in_stock?: boolean;
};

// Extended types with relationships
export type CartItemWithProduct = CartItem & {
  products: Product;
};

export type OrderWithItems = Order & {
  order_items: (OrderItem & {
    products: Product;
  })[];
  payments?: Payment[];
};

export type PaymentWithOrder = Payment & {
  orders: Order;
};






