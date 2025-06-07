export const shippingMethodTypes = [
  { value: "standard", label: "Giao hàng tiêu chuẩn" },
  { value: "express", label: "Giao hàng nhanh" },
  { value: "next_day", label: "Giao hàng trong ngày" },
  { value: "same_day", label: "Giao hàng cùng ngày" },
] as const;

export const weightUnits = [
  { value: "kg", label: "Kilogram (kg)" },
  { value: "g", label: "Gram (g)" },
] as const;

export const vietnamProvinces = [
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Đà Nẵng",
  "Hải Phòng",
  "Cần Thơ",
  "An Giang",
  "Bà Rịa - Vũng Tàu",
  "Bắc Giang",
  "Bắc Kạn",
  "Bạc Liêu",
  "Bắc Ninh",
  "Bến Tre",
  "Bình Định",
  "Bình Dương",
  "Bình Phước",
  "Bình Thuận",
  "Cà Mau",
  "Cao Bằng",
  "Đắk Lắk",
  "Đắk Nông",
  "Điện Biên",
  "Đồng Nai",
  "Đồng Tháp",
  "Gia Lai",
  "Hà Giang",
  "Hà Nam",
  "Hà Tĩnh",
  "Hải Dương",
  "Hậu Giang",
  "Hòa Bình",
  "Hưng Yên",
  "Khánh Hòa",
  "Kiên Giang",
  "Kon Tum",
  "Lai Châu",
  "Lâm Đồng",
  "Lạng Sơn",
  "Lào Cai",
  "Long An",
  "Nam Định",
  "Nghệ An",
  "Ninh Bình",
  "Ninh Thuận",
  "Phú Thọ",
  "Phú Yên",
  "Quảng Bình",
  "Quảng Nam",
  "Quảng Ngãi",
  "Quảng Ninh",
  "Quảng Trị",
  "Sóc Trăng",
  "Sơn La",
  "Tây Ninh",
  "Thái Bình",
  "Thái Nguyên",
  "Thanh Hóa",
  "Thừa Thiên Huế",
  "Tiền Giang",
  "Trà Vinh",
  "Tuyên Quang",
  "Vĩnh Long",
  "Vĩnh Phúc",
  "Yên Bái",
];

export function formatShippingCost(cost: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(cost);
}

export function formatWeight(weight: number, unit: string = "kg"): string {
  return `${weight} ${unit}`;
}

export function formatDeliveryTime(minDays: number, maxDays: number): string {
  if (minDays === maxDays) {
    return `${minDays} ngày`;
  }
  return `${minDays}-${maxDays} ngày`;
}

export function getShippingZoneStatusText(zone: { is_active: boolean }) {
  return zone.is_active
    ? { text: "Đang hoạt động", variant: "default" as const }
    : { text: "Tạm dừng", variant: "secondary" as const };
}

export function validateShippingZoneData(data: {
  name: string;
  countries: string[];
  states?: string[];
  cities?: string[];
}): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.length < 3) {
    errors.name = "Tên khu vực giao hàng phải có ít nhất 3 ký tự";
  }

  if (!data.countries || data.countries.length === 0) {
    errors.countries = "Phải có ít nhất một quốc gia";
  }

  return errors;
}

export function validateShippingRateData(data: {
  name: string;
  cost: number;
  estimated_days_min: number;
  estimated_days_max: number;
  free_shipping_threshold?: number;
}): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.length < 3) {
    errors.name = "Tên phương thức vận chuyển phải có ít nhất 3 ký tự";
  }

  if (!data.cost || data.cost <= 0) {
    errors.cost = "Phí vận chuyển phải lớn hơn 0";
  }

  if (!data.estimated_days_min || data.estimated_days_min <= 0) {
    errors.estimated_days_min = "Thời gian giao hàng tối thiểu phải lớn hơn 0";
  }

  if (!data.estimated_days_max || data.estimated_days_max <= 0) {
    errors.estimated_days_max = "Thời gian giao hàng tối đa phải lớn hơn 0";
  }

  if (data.estimated_days_max < data.estimated_days_min) {
    errors.estimated_days_max = "Thời gian tối đa phải lớn hơn hoặc bằng thời gian tối thiểu";
  }

  if (data.free_shipping_threshold && data.free_shipping_threshold <= 0) {
    errors.free_shipping_threshold = "Ngưỡng miễn phí vận chuyển phải lớn hơn 0";
  }

  return errors;
}

export function calculateShippingCost(
  baseRate: number,
  weight: number,
  weightBasedRate?: number,
  freeShippingThreshold?: number,
  orderValue?: number
): number {
  // Check for free shipping
  if (freeShippingThreshold && orderValue && orderValue >= freeShippingThreshold) {
    return 0;
  }

  let totalCost = baseRate;

  // Add weight-based cost if applicable
  if (weightBasedRate && weight > 0) {
    totalCost += weight * weightBasedRate;
  }

  return Math.max(0, totalCost);
} 