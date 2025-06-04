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

// Order status types from database schema
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

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

// Pagination params
export type PaginationParams = {
  page: number;
  limit: number;
};

// Product filters
export type ProductFilters = {
  category_id?: number;
  min_price?: number;
  max_price?: number;
  brand?: string;
  tags?: string[];
  is_featured?: boolean;
  in_stock?: boolean;
};

// Custom Claims Types for JWT
export interface CustomClaims {
  user_role: AppRole | null;
  permissions: string[];
}

// Extended User type with custom claims
export interface UserWithClaims {
  id: string;
  email?: string;
  user_metadata?: Record<string, string | number | boolean | null>;
  app_metadata?: Record<string, string | number | boolean | null>;
  custom_claims?: CustomClaims;
}

// RBAC Context type for React context
export interface RBACContext {
  userRole: AppRole | null;
  permissions: string[];
  hasPermission: (permission: AppPermission) => boolean;
  isLoading: boolean;
  refreshPermissions: () => Promise<void>;
}

// Helper type for permission checking
export type PermissionChecker = (permission: AppPermission) => boolean;
