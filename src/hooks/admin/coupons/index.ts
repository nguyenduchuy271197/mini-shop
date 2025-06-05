// Admin coupons query hooks
export { useAdminCoupons } from "./use-admin-coupons";
export { useCouponUsage } from "./use-coupon-usage";
export { useValidateCoupon } from "./use-validate-coupon";

// Admin coupons mutation hooks
export { useCreateCoupon } from "./use-create-coupon";
export { useUpdateCoupon } from "./use-update-coupon";
export { useDeleteCoupon } from "./use-delete-coupon";
export { useApplyCoupon } from "./use-apply-coupon";

// Export types
export type { UseAdminCouponsParams, AdminCouponsResponse } from "./use-admin-coupons";
export type { CreateCouponData, CreateCouponResponse, UseCreateCouponOptions } from "./use-create-coupon";
export type { UpdateCouponData, UpdateCouponResponse, UseUpdateCouponOptions } from "./use-update-coupon";
export type { DeleteCouponData, DeleteCouponResponse, UseDeleteCouponOptions } from "./use-delete-coupon";
export type { ApplyCouponData, ApplyCouponResponse, UseApplyCouponOptions } from "./use-apply-coupon";
export type { UseValidateCouponParams, CouponValidation, ValidateCouponResponse } from "./use-validate-coupon";
export type { UseCouponUsageParams, CouponUsageReport, CouponUsageResponse } from "./use-coupon-usage"; 