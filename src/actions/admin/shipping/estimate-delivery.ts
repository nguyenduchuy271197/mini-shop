"use server";

import { AddressData } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const estimateDeliverySchema = z.object({
  address: z.object({
    country: z.string().min(2, "Mã quốc gia không hợp lệ"),
    state: z.string().min(1, "Tỉnh/thành không thể trống"),
    city: z.string().min(1, "Thành phố không thể trống"),
    postal_code: z.string().min(1, "Mã bưu điện không thể trống"),
  }),
  method: z.string().min(1, "Phương thức giao hàng không thể trống"),
});

type DeliveryEstimate = {
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  estimatedDeliveryDate: {
    earliest: string;
    latest: string;
  };
  shippingMethod: string;
  shippingZone: string;
  isBusinessDaysOnly: boolean;
  notes?: string;
};

type EstimateDeliveryResult =
  | { success: true; estimate: DeliveryEstimate }
  | { success: false; error: string };

// Mock shipping methods data
const mockShippingMethods = [
  {
    name: "Giao hàng tiêu chuẩn",
    estimatedDaysMin: 3,
    estimatedDaysMax: 5,
    zones: ["TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng"],
    countries: ["VN"],
  },
  {
    name: "Giao hàng nhanh",
    estimatedDaysMin: 1,
    estimatedDaysMax: 2,
    zones: ["TP. Hồ Chí Minh", "Hà Nội"],
    countries: ["VN"],
  },
  {
    name: "Giao hàng siêu tốc",
    estimatedDaysMin: 0,
    estimatedDaysMax: 1,
    zones: ["TP. Hồ Chí Minh"],
    countries: ["VN"],
  },
];

export async function estimateDeliveryTime(
  address: AddressData,
  method: string
): Promise<EstimateDeliveryResult> {
  try {
    // Validate input
    const validatedData = estimateDeliverySchema.parse({ address, method });

    // Tìm phương thức giao hàng trong mock data
    const shippingMethod = mockShippingMethods.find(
      m => m.name === validatedData.method
    );

    if (!shippingMethod) {
      return {
        success: false,
        error: "Phương thức giao hàng không tồn tại",
      };
    }

    // Kiểm tra xem địa chỉ có trong zone hỗ trợ không
    const isCountrySupported = shippingMethod.countries.includes(validatedData.address.country);
    const isCitySupported = shippingMethod.zones.includes(validatedData.address.city);

    if (!isCountrySupported) {
      return {
        success: false,
        error: "Phương thức giao hàng không hỗ trợ quốc gia này",
      };
    }

    // Nếu method có giới hạn zone và city không được support
    if (shippingMethod.zones.length > 0 && !isCitySupported) {
      return {
        success: false,
        error: "Phương thức giao hàng không có sẵn cho địa chỉ này",
      };
    }

    // Tính toán ngày giao hàng ước tính
    const today = new Date();
    const isBusinessDaysOnly = true; // Chỉ tính ngày làm việc

    // Hàm tính ngày làm việc (bỏ qua thứ 7, chủ nhật)
    const addBusinessDays = (startDate: Date, days: number): Date => {
      const result = new Date(startDate);
      let addedDays = 0;

      while (addedDays < days) {
        result.setDate(result.getDate() + 1);
        // Bỏ qua thứ 7 (6) và chủ nhật (0)
        if (result.getDay() !== 0 && result.getDay() !== 6) {
          addedDays++;
        }
      }

      return result;
    };

    const earliestDelivery = isBusinessDaysOnly 
      ? addBusinessDays(today, shippingMethod.estimatedDaysMin)
      : new Date(today.getTime() + shippingMethod.estimatedDaysMin * 24 * 60 * 60 * 1000);

    const latestDelivery = isBusinessDaysOnly
      ? addBusinessDays(today, shippingMethod.estimatedDaysMax)
      : new Date(today.getTime() + shippingMethod.estimatedDaysMax * 24 * 60 * 60 * 1000);

    // Thêm ghi chú đặc biệt dựa trên địa chỉ
    let notes: string | undefined;
    
    // Ghi chú cho các khu vực xa
    if (validatedData.address.country !== "VN") {
      notes = "Thời gian giao hàng có thể bị ảnh hưởng bởi thủ tục hải quan";
    } else if (["Cao Bằng", "Hà Giang", "Lai Châu", "Lào Cai", "Điện Biên"].includes(validatedData.address.state)) {
      notes = "Khu vực miền núi, thời gian giao hàng có thể chậm hơn do điều kiện địa hình";
    }

    // Xác định zone name
    let zoneName = "Vietnam";
    if (["TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng"].includes(validatedData.address.city)) {
      zoneName = "Vietnam - Thành phố lớn";
    } else {
      zoneName = "Vietnam - Tỉnh lẻ";
    }

    const estimate: DeliveryEstimate = {
      estimatedDaysMin: shippingMethod.estimatedDaysMin,
      estimatedDaysMax: shippingMethod.estimatedDaysMax,
      estimatedDeliveryDate: {
        earliest: earliestDelivery.toISOString().split('T')[0],
        latest: latestDelivery.toISOString().split('T')[0],
      },
      shippingMethod: shippingMethod.name,
      shippingZone: zoneName,
      isBusinessDaysOnly,
      notes,
    };

    return {
      success: true,
      estimate,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }

    return {
      success: false,
      error: "Đã xảy ra lỗi không mong muốn khi ước tính thời gian giao hàng",
    };
  }
} 