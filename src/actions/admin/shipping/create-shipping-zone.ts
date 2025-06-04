"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schema cho shipping zone
const createShippingZoneSchema = z.object({
  name: z.string().min(2, "Tên khu vực giao hàng phải có ít nhất 2 ký tự"),
  description: z.string().optional(),
  countries: z.array(z.string().min(2, "Mã quốc gia không hợp lệ")).min(1, "Phải có ít nhất một quốc gia"),
  states: z.array(z.string()).optional(),
  cities: z.array(z.string()).optional(),
  is_active: z.boolean().default(true),
});

type ShippingZoneData = z.infer<typeof createShippingZoneSchema>;

type ShippingZone = {
  id: number;
  name: string;
  description: string | null;
  countries: string[];
  states: string[] | null;
  cities: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
};

type CreateShippingZoneResult =
  | { success: true; message: string; zone: ShippingZone }
  | { success: false; error: string };

export async function createShippingZone(
  zoneData: ShippingZoneData
): Promise<CreateShippingZoneResult> {
  try {
    // Validate input
    const validatedData = createShippingZoneSchema.parse(zoneData);

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

    // Kiểm tra authorization - chỉ admin mới có thể tạo shipping zone
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || userRole?.role !== "admin") {
      return {
        success: false,
        error: "Chỉ admin mới có thể tạo khu vực giao hàng",
      };
    }

    // Mock implementation - tạo shipping zone giả lập
    const newZone: ShippingZone = {
      id: Math.floor(Math.random() * 1000) + 1,
      name: validatedData.name,
      description: validatedData.description || null,
      countries: validatedData.countries,
      states: validatedData.states || null,
      cities: validatedData.cities || null,
      is_active: validatedData.is_active,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: user.id,
    };

    // Trong thực tế, zone sẽ được lưu vào database
    // Hiện tại chỉ return success với mock data

    return {
      success: true,
      message: "Tạo khu vực giao hàng thành công (Mock implementation)",
      zone: newZone,
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
      error: "Đã xảy ra lỗi không mong muốn khi tạo khu vực giao hàng",
    };
  }
} 