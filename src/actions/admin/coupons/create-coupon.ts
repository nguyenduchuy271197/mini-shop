"use server";

import { createClient } from "@/lib/supabase/server";
import { Coupon } from "@/types/custom.types";
import { z } from "zod";

// Schema validation cho tạo coupon
const createCouponSchema = z.object({
  code: z.string().min(3, "Mã coupon phải có ít nhất 3 ký tự").max(50, "Mã coupon không được quá 50 ký tự"),
  name: z.string().min(2, "Tên coupon phải có ít nhất 2 ký tự").max(255, "Tên coupon không được quá 255 ký tự"),
  type: z.enum(["percentage", "fixed_amount"], { 
    required_error: "Loại coupon là bắt buộc",
    invalid_type_error: "Loại coupon không hợp lệ" 
  }),
  value: z.number().positive("Giá trị coupon phải lớn hơn 0"),
  minimum_amount: z.number().min(0, "Số tiền tối thiểu không được âm").optional(),
  maximum_discount: z.number().positive("Giảm giá tối đa phải lớn hơn 0").optional(),
  usage_limit: z.number().int().positive("Giới hạn sử dụng phải là số nguyên dương").optional(),
  starts_at: z.string().datetime("Ngày bắt đầu không hợp lệ").optional(),
  expires_at: z.string().datetime("Ngày hết hạn không hợp lệ").optional(),
}).refine((data) => {
  // Kiểm tra ngày hết hạn phải sau ngày bắt đầu
  if (data.starts_at && data.expires_at) {
    return new Date(data.expires_at) > new Date(data.starts_at);
  }
  return true;
}, {
  message: "Ngày hết hạn phải sau ngày bắt đầu",
  path: ["expires_at"]
});

type CreateCouponData = z.infer<typeof createCouponSchema>;

type CreateCouponResult =
  | { 
      success: true; 
      message: string; 
      coupon: Coupon;
    }
  | { success: false; error: string };

export async function createCoupon(
  couponData: CreateCouponData
): Promise<CreateCouponResult> {
  try {
    // Validate input
    const validatedData = createCouponSchema.parse(couponData);

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

    // Kiểm tra authorization - chỉ admin mới có thể tạo coupon
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || userRole?.role !== "admin") {
      return {
        success: false,
        error: "Chỉ admin mới có thể tạo coupon",
      };
    }

    // Kiểm tra mã coupon đã tồn tại chưa
    const { data: existingCoupon, error: checkError } = await supabase
      .from("coupons")
      .select("id")
      .eq("code", validatedData.code)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      return {
        success: false,
        error: "Lỗi khi kiểm tra mã coupon",
      };
    }

    if (existingCoupon) {
      return {
        success: false,
        error: "Mã coupon đã tồn tại",
      };
    }

    // Tạo coupon mới
    const { data, error } = await supabase
      .from("coupons")
      .insert({
        code: validatedData.code,
        name: validatedData.name,
        type: validatedData.type,
        value: validatedData.value,
        minimum_amount: validatedData.minimum_amount || 0,
        maximum_discount: validatedData.maximum_discount,
        usage_limit: validatedData.usage_limit,
        starts_at: validatedData.starts_at || new Date().toISOString(),
        expires_at: validatedData.expires_at,
      })
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (!data) {
      return {
        success: false,
        error: "Không thể tạo coupon",
      };
    }

    return {
      success: true,
      message: "Coupon đã được tạo thành công",
      coupon: data,
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
      error: "Đã xảy ra lỗi không mong muốn khi tạo coupon",
    };
  }
} 