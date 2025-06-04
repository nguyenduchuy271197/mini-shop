"use server";

import { AddressData } from "@/types/custom.types";
import { z } from "zod";

// Validation schema cho cart item
const cartItemSchema = z.object({
  product_id: z.number().int().positive(),
  quantity: z.number().int().positive(),
  weight: z.number().min(0).optional(),
});

const calculateShippingSchema = z.object({
  address: z.object({
    country: z.string().min(2, "Mã quốc gia không hợp lệ"),
    state: z.string().min(1, "Tỉnh/thành không thể trống"),
    city: z.string().min(1, "Thành phố không thể trống"),
    postal_code: z.string().min(1, "Mã bưu điện không thể trống"),
  }),
  items: z.array(cartItemSchema).min(1, "Phải có ít nhất một sản phẩm"),
});

type CartItem = z.infer<typeof cartItemSchema>;

type ShippingOption = {
  id: number;
  name: string;
  description: string | null;
  cost: number;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  isFreeShipping: boolean;
};

type CalculateShippingResult =
  | { 
      success: true; 
      shippingOptions: ShippingOption[];
      totalWeight: number;
      totalValue: number;
    }
  | { success: false; error: string };

// Mock shipping data cho Vietnam
const mockShippingOptions = [
  {
    id: 1,
    name: "Giao hàng tiêu chuẩn",
    description: "Giao hàng trong 3-5 ngày làm việc",
    cost: 30000,
    estimatedDaysMin: 3,
    estimatedDaysMax: 5,
    countries: ["VN"],
    cities: ["TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng"],
    freeShippingThreshold: 500000,
  },
  {
    id: 2,
    name: "Giao hàng nhanh",
    description: "Giao hàng trong 1-2 ngày làm việc",
    cost: 50000,
    estimatedDaysMin: 1,
    estimatedDaysMax: 2,
    countries: ["VN"],
    cities: ["TP. Hồ Chí Minh", "Hà Nội"],
    freeShippingThreshold: 1000000,
  },
  {
    id: 3,
    name: "Giao hàng siêu tốc",
    description: "Giao hàng trong ngày",
    cost: 80000,
    estimatedDaysMin: 0,
    estimatedDaysMax: 1,
    countries: ["VN"],
    cities: ["TP. Hồ Chí Minh"],
    freeShippingThreshold: null,
  },
];

export async function calculateShippingCost(
  address: AddressData,
  items: CartItem[]
): Promise<CalculateShippingResult> {
  try {
    // Validate input
    const validatedData = calculateShippingSchema.parse({ address, items });

    // Mock calculation - tính tổng weight và value
    let totalWeight = 0;
    let totalValue = 0;

    // Mock product data - trong thực tế sẽ query từ database
    const mockProducts = new Map([
      [1, { price: 100000, weight: 0.5 }],
      [2, { price: 200000, weight: 1.0 }],
      [3, { price: 300000, weight: 1.5 }],
    ]);

    for (const item of validatedData.items) {
      const product = mockProducts.get(item.product_id) || { price: 150000, weight: 1.0 };
      const itemWeight = item.weight || product.weight;
      totalWeight += itemWeight * item.quantity;
      totalValue += product.price * item.quantity;
    }

    // Tìm shipping options phù hợp với địa chỉ
    const availableOptions = mockShippingOptions.filter(option => {
      // Kiểm tra country
      if (!option.countries.includes(validatedData.address.country)) {
        return false;
      }

      // Kiểm tra city cho một số phương thức giao hàng
      if (option.cities && option.cities.length > 0) {
        if (!option.cities.includes(validatedData.address.city)) {
          return false;
        }
      }

      return true;
    });

    if (availableOptions.length === 0) {
      return {
        success: false,
        error: "Không có phương thức giao hàng nào phù hợp với địa chỉ này",
      };
    }

    // Tính phí shipping cho từng option
    const shippingOptions: ShippingOption[] = availableOptions.map(option => {
      let shippingCost = option.cost;
      let isFreeShipping = false;

      // Kiểm tra free shipping threshold
      if (option.freeShippingThreshold && totalValue >= option.freeShippingThreshold) {
        shippingCost = 0;
        isFreeShipping = true;
      }

      // Tính phí dựa trên weight (simple calculation)
      if (totalWeight > 5) {
        shippingCost += Math.ceil((totalWeight - 5) / 2) * 10000;
      }

      return {
        id: option.id,
        name: option.name,
        description: option.description,
        cost: isFreeShipping ? 0 : shippingCost,
        estimatedDaysMin: option.estimatedDaysMin,
        estimatedDaysMax: option.estimatedDaysMax,
        isFreeShipping,
      };
    });

    // Sắp xếp theo giá từ thấp đến cao
    shippingOptions.sort((a, b) => a.cost - b.cost);

    return {
      success: true,
      shippingOptions,
      totalWeight,
      totalValue,
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
      error: "Đã xảy ra lỗi không mong muốn khi tính phí giao hàng",
    };
  }
} 