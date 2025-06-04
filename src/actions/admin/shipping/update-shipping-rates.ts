"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schema cho shipping rate
const shippingRateSchema = z.object({
  name: z.string().min(2, "Tên phương thức giao hàng phải có ít nhất 2 ký tự"),
  description: z.string().optional(),
  cost: z.number().min(0, "Phí giao hàng không thể âm"),
  free_shipping_threshold: z.number().min(0, "Ngưỡng freeship không thể âm").optional(),
  estimated_days_min: z.number().int().min(1, "Số ngày ước tính tối thiểu phải lớn hơn 0"),
  estimated_days_max: z.number().int().min(1, "Số ngày ước tính tối đa phải lớn hơn 0"),
  weight_based: z.boolean().default(false),
  weight_rates: z.array(z.object({
    min_weight: z.number().min(0),
    max_weight: z.number().min(0),
    rate: z.number().min(0),
  })).optional(),
  is_active: z.boolean().default(true),
}).refine((data) => {
  return data.estimated_days_max >= data.estimated_days_min;
}, {
  message: "Số ngày ước tính tối đa phải lớn hơn hoặc bằng tối thiểu",
  path: ["estimated_days_max"]
});

const updateShippingRatesSchema = z.object({
  zoneId: z.number().int().positive("ID khu vực giao hàng không hợp lệ"),
  rates: z.array(shippingRateSchema).min(1, "Phải có ít nhất một phương thức giao hàng"),
});

type ShippingRateData = z.infer<typeof shippingRateSchema>;

type ShippingRate = {
  id: number;
  zone_id: number;
  name: string;
  description: string | null;
  cost: number;
  free_shipping_threshold: number | null;
  estimated_days_min: number;
  estimated_days_max: number;
  weight_based: boolean;
  weight_rates: Array<{
    min_weight: number;
    max_weight: number;
    rate: number;
  }> | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
};

type UpdateShippingRatesResult =
  | { success: true; message: string; rates: ShippingRate[] }
  | { success: false; error: string };

export async function updateShippingRates(
  zoneId: number,
  rates: ShippingRateData[]
): Promise<UpdateShippingRatesResult> {
  try {
    // Validate input
    const validatedData = updateShippingRatesSchema.parse({ zoneId, rates });

    const supabase = createClient();

    // Kiểm tra authentication
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "Người dùng chưa được xác thực",
      };
    }

    // Kiểm tra authorization - chỉ admin mới có thể cập nhật shipping rates
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || userRole?.role !== "admin") {
      return {
        success: false,
        error: "Chỉ admin mới có thể cập nhật phí giao hàng",
      };
    }

    // Mock implementation - tạo rates giả lập
    const mockZoneName = `Zone ${validatedData.zoneId}`;

    const createdRates: ShippingRate[] = validatedData.rates.map((rate, index) => ({
      id: Math.floor(Math.random() * 1000) + index + 1,
      zone_id: validatedData.zoneId,
      name: rate.name,
      description: rate.description || null,
      cost: rate.cost,
      free_shipping_threshold: rate.free_shipping_threshold || null,
      estimated_days_min: rate.estimated_days_min,
      estimated_days_max: rate.estimated_days_max,
      weight_based: rate.weight_based,
      weight_rates: rate.weight_rates || null,
      is_active: rate.is_active,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: user.id,
    }));

    // Trong thực tế, rates sẽ được lưu vào database
    // Hiện tại chỉ return success với mock data

    return {
      success: true,
      message: `Cập nhật ${createdRates.length} phương thức giao hàng thành công cho khu vực ${mockZoneName} (Mock implementation)`,
      rates: createdRates,
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
      error: "Đã xảy ra lỗi không mong muốn khi cập nhật phí giao hàng",
    };
  }
} 