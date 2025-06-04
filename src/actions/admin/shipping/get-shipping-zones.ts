"use server";

import { createClient } from "@/lib/supabase/server";
import { PaginationParams } from "@/types/custom.types";

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
  shipping_rates: Array<{
    id: number;
    name: string;
    description: string | null;
    cost: number;
    free_shipping_threshold: number | null;
    estimated_days_min: number;
    estimated_days_max: number;
    weight_based: boolean;
    is_active: boolean;
  }>;
};

type GetShippingZonesResult =
  | { 
      success: true; 
      zones: ShippingZone[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }
  | { success: false; error: string };

// Mock shipping zones data
const mockShippingZones: ShippingZone[] = [
  {
    id: 1,
    name: "Vietnam - Thành phố lớn",
    description: "Khu vực giao hàng cho các thành phố lớn",
    countries: ["VN"],
    states: ["TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng"],
    cities: ["TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng"],
    is_active: true,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
    shipping_rates: [
      {
        id: 1,
        name: "Giao hàng tiêu chuẩn",
        description: "Giao hàng trong 3-5 ngày làm việc",
        cost: 30000,
        free_shipping_threshold: 500000,
        estimated_days_min: 3,
        estimated_days_max: 5,
        weight_based: false,
        is_active: true,
      },
      {
        id: 2,
        name: "Giao hàng nhanh",
        description: "Giao hàng trong 1-2 ngày làm việc",
        cost: 50000,
        free_shipping_threshold: 1000000,
        estimated_days_min: 1,
        estimated_days_max: 2,
        weight_based: false,
        is_active: true,
      },
    ],
  },
  {
    id: 2,
    name: "Vietnam - Tỉnh lẻ",
    description: "Khu vực giao hàng cho các tỉnh khác",
    countries: ["VN"],
    states: null,
    cities: null,
    is_active: true,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
    shipping_rates: [
      {
        id: 3,
        name: "Giao hàng tiêu chuẩn",
        description: "Giao hàng trong 5-7 ngày làm việc",
        cost: 40000,
        free_shipping_threshold: 500000,
        estimated_days_min: 5,
        estimated_days_max: 7,
        weight_based: false,
        is_active: true,
      },
    ],
  },
];

export async function getShippingZones(
  pagination?: PaginationParams,
  includeInactive?: boolean
): Promise<GetShippingZonesResult> {
  try {
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

    // Kiểm tra authorization - chỉ admin mới có thể xem shipping zones
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || userRole?.role !== "admin") {
      return {
        success: false,
        error: "Chỉ admin mới có thể xem danh sách khu vực giao hàng",
      };
    }

    // Thiết lập pagination
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const offset = (page - 1) * limit;

    // Filter mock data
    let filteredZones = mockShippingZones;
    if (!includeInactive) {
      filteredZones = filteredZones.filter(zone => zone.is_active);
    }

    // Apply pagination
    const total = filteredZones.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedZones = filteredZones.slice(offset, offset + limit);

    return {
      success: true,
      zones: paginatedZones,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  } catch {
    return {
      success: false,
      error: "Đã xảy ra lỗi không mong muốn khi lấy danh sách khu vực giao hàng",
    };
  }
} 