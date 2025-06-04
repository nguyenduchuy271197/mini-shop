"use server";

import { createClient } from "@/lib/supabase/server";
import { Coupon, PaginationParams } from "@/types/custom.types";

type GetCouponsResult =
  | { 
      success: true; 
      coupons: Coupon[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }
  | { success: false; error: string };

export async function getCoupons(
  pagination?: PaginationParams
): Promise<GetCouponsResult> {
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

    // Kiểm tra authorization - chỉ admin mới có thể xem tất cả coupon
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || userRole?.role !== "admin") {
      return {
        success: false,
        error: "Chỉ admin mới có thể xem danh sách coupon",
      };
    }

    // Thiết lập pagination mặc định
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const offset = (page - 1) * limit;

    // Đếm tổng số coupon
    const { count: totalCount, error: countError } = await supabase
      .from("coupons")
      .select("*", { count: "exact", head: true });

    if (countError) {
      return {
        success: false,
        error: "Lỗi khi đếm số lượng coupon",
      };
    }

    // Lấy danh sách coupons với pagination
    const { data: coupons, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (!coupons) {
      return {
        success: false,
        error: "Không thể lấy danh sách coupon",
      };
    }

    const total = totalCount || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      coupons,
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
      error: "Đã xảy ra lỗi không mong muốn khi lấy danh sách coupon",
    };
  }
} 