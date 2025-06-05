"use server";

import { createClient } from "@/lib/supabase/server";
import { Coupon, CouponUpdateDto } from "@/types/custom.types";
import { z } from "zod";

// Schema validation cho cập nhật coupon
const updateCouponSchema = z.object({
  name: z.string().min(2, "Tên coupon phải có ít nhất 2 ký tự").max(255, "Tên coupon không được quá 255 ký tự").optional(),
  type: z.enum(["percentage", "fixed_amount"], { 
    invalid_type_error: "Loại coupon không hợp lệ" 
  }).optional(),
  value: z.number().positive("Giá trị coupon phải lớn hơn 0").optional(),
  minimum_amount: z.number().min(0, "Số tiền tối thiểu không được âm").optional(),
  maximum_discount: z.number().positive("Giảm giá tối đa phải lớn hơn 0").optional(),
  usage_limit: z.number().int().positive("Giới hạn sử dụng phải là số nguyên dương").optional(),
  is_active: z.boolean({
    invalid_type_error: "Trạng thái hoạt động phải là boolean"
  }).optional(),
  starts_at: z.string().datetime("Ngày bắt đầu không hợp lệ").optional(),
  expires_at: z.string().datetime("Ngày hết hạn không hợp lệ").optional(),
}).refine((data) => {
  // Kiểm tra ngày hết hạn phải sau ngày bắt đầu nếu cả hai đều được cung cấp
  if (data.starts_at && data.expires_at) {
    return new Date(data.expires_at) > new Date(data.starts_at);
  }
  return true;
}, {
  message: "Ngày hết hạn phải sau ngày bắt đầu",
  path: ["expires_at"]
});

type UpdateCouponData = z.infer<typeof updateCouponSchema>;

// Type for the update data object
type CouponUpdatePayload = CouponUpdateDto & {
  updated_at: string;
};

type UpdateCouponResult =
  | { 
      success: true; 
      message: string; 
      coupon: Coupon;
    }
  | { success: false; error: string };

export async function updateCoupon(
  couponId: number,
  couponData: UpdateCouponData
): Promise<UpdateCouponResult> {
  try {
    // Validate input
    const validatedData = updateCouponSchema.parse(couponData);

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

    // Kiểm tra authorization - chỉ admin mới có thể cập nhật coupon
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || userRole?.role !== "admin") {
      return {
        success: false,
        error: "Chỉ admin mới có thể cập nhật coupon",
      };
    }

    // Kiểm tra coupon có tồn tại không
    const { data: existingCoupon, error: checkError } = await supabase
      .from("coupons")
      .select("id, starts_at, expires_at")
      .eq("id", couponId)
      .single();

    if (checkError || !existingCoupon) {
      return {
        success: false,
        error: "Coupon không tồn tại",
      };
    }

    // Tạo object update chỉ với các field được cung cấp
    const updateData: Partial<CouponUpdatePayload> = {
      updated_at: new Date().toISOString(),
    };

    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.type !== undefined) updateData.type = validatedData.type;
    if (validatedData.value !== undefined) updateData.value = validatedData.value;
    if (validatedData.minimum_amount !== undefined) updateData.minimum_amount = validatedData.minimum_amount;
    if (validatedData.maximum_discount !== undefined) updateData.maximum_discount = validatedData.maximum_discount;
    if (validatedData.usage_limit !== undefined) updateData.usage_limit = validatedData.usage_limit;
    if (validatedData.is_active !== undefined) updateData.is_active = validatedData.is_active;
    if (validatedData.starts_at !== undefined) updateData.starts_at = validatedData.starts_at;
    if (validatedData.expires_at !== undefined) updateData.expires_at = validatedData.expires_at;

    // Kiểm tra logic ngày tháng với dữ liệu hiện tại
    const finalStartsAt = validatedData.starts_at || existingCoupon.starts_at;
    const finalExpiresAt = validatedData.expires_at || existingCoupon.expires_at;
    
    if (finalStartsAt && finalExpiresAt && new Date(finalExpiresAt) <= new Date(finalStartsAt)) {
      return {
        success: false,
        error: "Ngày hết hạn phải sau ngày bắt đầu",
      };
    }

    // Cập nhật coupon
    const { data, error } = await supabase
      .from("coupons")
      .update(updateData)
      .eq("id", couponId)
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
        error: "Không thể cập nhật coupon",
      };
    }

    return {
      success: true,
      message: "Coupon đã được cập nhật thành công",
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
      error: "Đã xảy ra lỗi không mong muốn khi cập nhật coupon",
    };
  }
} 