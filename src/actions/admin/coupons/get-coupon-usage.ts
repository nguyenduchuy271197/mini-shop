"use server";

import { createClient } from "@/lib/supabase/server";
import { Coupon } from "@/types/custom.types";

type CouponUsageReport = {
  coupon: Coupon;
  totalUsed: number;
  remainingUses?: number;
  usagePercentage: number;
  recentOrders: Array<{
    id: number;
    order_number: string;
    total_amount: number;
    discount_amount: number;
    created_at: string;
    user_email?: string;
  }>;
  totalRevenueLoss: number;
  totalOrdersWithCoupon: number;
};

type GetCouponUsageResult =
  | { 
      success: true; 
      report: CouponUsageReport;
    }
  | { success: false; error: string };

export async function getCouponUsageReport(
  couponId: number
): Promise<GetCouponUsageResult> {
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

    // Kiểm tra authorization - chỉ admin mới có thể xem báo cáo
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || userRole?.role !== "admin") {
      return {
        success: false,
        error: "Chỉ admin mới có thể xem báo cáo sử dụng coupon",
      };
    }

    // Lấy thông tin coupon
    const { data: coupon, error: couponError } = await supabase
      .from("coupons")
      .select("*")
      .eq("id", couponId)
      .single();

    if (couponError || !coupon) {
      return {
        success: false,
        error: "Coupon không tồn tại",
      };
    }

    // Lấy danh sách đơn hàng đã sử dụng coupon này
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select(`
        id,
        order_number,
        total_amount,
        discount_amount,
        created_at,
        user_id
      `)
      .eq("coupon_id", couponId)
      .order("created_at", { ascending: false });

    if (ordersError) {
      return {
        success: false,
        error: "Lỗi khi lấy danh sách đơn hàng",
      };
    }

    // Lấy email của users đã sử dụng coupon (chỉ lấy 10 đơn hàng gần nhất)
    const recentOrdersWithUserInfo = await Promise.all(
      (orders || []).slice(0, 10).map(async (order) => {
        let user_email: string | undefined;

        if (order.user_id) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("email")
            .eq("id", order.user_id)
            .single();
          
          user_email = profile?.email;
        }
        
        return {
          id: order.id,
          order_number: order.order_number,
          total_amount: order.total_amount,
          discount_amount: order.discount_amount || 0, // Chuyển null thành 0
          created_at: order.created_at,
          user_email,
        };
      })
    );

    // Tính toán thống kê
    const totalUsed = coupon.used_count;
    const remainingUses = coupon.usage_limit ? coupon.usage_limit - totalUsed : undefined;
    const usagePercentage = coupon.usage_limit 
      ? Math.round((totalUsed / coupon.usage_limit) * 100) 
      : 0;

    // Tính tổng doanh thu giảm do coupon
    const totalRevenueLoss = (orders || []).reduce((total, order) => {
      return total + (order.discount_amount || 0);
    }, 0);

    const totalOrdersWithCoupon = orders?.length || 0;

    const report: CouponUsageReport = {
      coupon,
      totalUsed,
      remainingUses,
      usagePercentage,
      recentOrders: recentOrdersWithUserInfo,
      totalRevenueLoss,
      totalOrdersWithCoupon,
    };

    return {
      success: true,
      report,
    };
  } catch {
    return {
      success: false,
      error: "Đã xảy ra lỗi không mong muốn khi lấy báo cáo sử dụng coupon",
    };
  }
} 