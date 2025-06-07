export const couponTypes = [
  { value: "percentage", label: "Phần trăm (%)" },
  { value: "fixed_amount", label: "Số tiền cố định (VND)" },
] as const;

export const couponStatusOptions = [
  { value: "all", label: "Tất cả" },
  { value: "active", label: "Đang hoạt động" },
  { value: "inactive", label: "Tạm dừng" },
  { value: "expired", label: "Đã hết hạn" },
] as const;

export function getCouponStatusText(coupon: {
  is_active: boolean;
  expires_at: string | null;
  starts_at: string;
}) {
  const now = new Date();
  const startsAt = new Date(coupon.starts_at);
  const expiresAt = coupon.expires_at ? new Date(coupon.expires_at) : null;

  if (!coupon.is_active) {
    return { text: "Tạm dừng", variant: "secondary" as const };
  }

  if (startsAt > now) {
    return { text: "Chưa bắt đầu", variant: "outline" as const };
  }

  if (expiresAt && expiresAt <= now) {
    return { text: "Đã hết hạn", variant: "destructive" as const };
  }

  return { text: "Đang hoạt động", variant: "default" as const };
}

export function formatCouponValue(type: string, value: number) {
  if (type === "percentage") {
    return `${value}%`;
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

export function formatUsageLimit(usageLimit: number | null, usedCount: number) {
  if (!usageLimit) {
    return `${usedCount} lần sử dụng`;
  }
  return `${usedCount}/${usageLimit} lần sử dụng`;
}

export function validateCouponCode(code: string): string | null {
  if (!code || code.length < 3) {
    return "Mã coupon phải có ít nhất 3 ký tự";
  }
  
  if (code.length > 20) {
    return "Mã coupon không được quá 20 ký tự";
  }
  
  if (!/^[A-Z0-9_-]+$/.test(code)) {
    return "Mã coupon chỉ được chứa chữ hoa, số, dấu _ và -";
  }
  
  return null;
}

export function validateCouponData(data: {
  name: string;
  type: string;
  value: number;
  minimum_amount?: number;
  maximum_discount?: number;
  usage_limit?: number;
  starts_at?: string;
  expires_at?: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.length < 3) {
    errors.name = "Tên coupon phải có ít nhất 3 ký tự";
  }

  if (!data.type || !["percentage", "fixed_amount"].includes(data.type)) {
    errors.type = "Loại coupon không hợp lệ";
  }

  if (!data.value || data.value <= 0) {
    errors.value = "Giá trị coupon phải lớn hơn 0";
  }

  if (data.type === "percentage" && data.value > 100) {
    errors.value = "Giá trị phần trăm không được quá 100%";
  }

  if (data.minimum_amount && data.minimum_amount < 0) {
    errors.minimum_amount = "Số tiền tối thiểu không được âm";
  }

  if (data.maximum_discount && data.maximum_discount <= 0) {
    errors.maximum_discount = "Giảm giá tối đa phải lớn hơn 0";
  }

  if (data.usage_limit && data.usage_limit <= 0) {
    errors.usage_limit = "Giới hạn sử dụng phải lớn hơn 0";
  }

  if (data.starts_at && data.expires_at) {
    const startDate = new Date(data.starts_at);
    const endDate = new Date(data.expires_at);
    
    if (endDate <= startDate) {
      errors.expires_at = "Ngày hết hạn phải sau ngày bắt đầu";
    }
  }

  return errors;
} 