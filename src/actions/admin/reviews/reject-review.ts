"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schema
const rejectReviewSchema = z.object({
  reviewId: z.number().int().positive("ID đánh giá không hợp lệ"),
  reason: z.string().optional(),
});

type RejectReviewResult =
  | { success: true; message: string; review: {
      id: number;
      title: string | null;
      comment: string | null;
      rating: number;
      is_approved: boolean;
      user_id: string;
      product_id: number;
    } }
  | { success: false; error: string };

export async function rejectReview(
  reviewId: number,
  reason?: string
): Promise<RejectReviewResult> {
  try {
    // Validate input
    const validatedData = rejectReviewSchema.parse({ reviewId, reason });

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

    // Kiểm tra authorization - chỉ admin mới có thể reject reviews
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || userRole?.role !== "admin") {
      return {
        success: false,
        error: "Chỉ admin mới có thể từ chối đánh giá",
      };
    }

    // Kiểm tra review có tồn tại không
    const { data: existingReview, error: checkError } = await supabase
      .from("reviews")
      .select(`
        id,
        title,
        comment,
        rating,
        is_approved,
        user_id,
        product_id
      `)
      .eq("id", validatedData.reviewId)
      .single();

    if (checkError || !existingReview) {
      return {
        success: false,
        error: "Đánh giá không tồn tại",
      };
    }

    // Lấy thông tin user và product
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", existingReview.user_id)
      .single();

    const { data: product } = await supabase
      .from("products")
      .select("name")
      .eq("id", existingReview.product_id)
      .single();

    // Xóa review thay vì chỉ đánh dấu rejected
    // Trong một số trường hợp có thể muốn soft delete hoặc thêm trường rejected
    const { error: deleteError } = await supabase
      .from("reviews")
      .delete()
      .eq("id", validatedData.reviewId);

    if (deleteError) {
      return {
        success: false,
        error: "Lỗi khi từ chối đánh giá",
      };
    }

    // Gửi email thông báo cho user (optional)
    // Có thể thêm email service sau này
    const rejectionReason = validatedData.reason || "Không đáp ứng tiêu chuẩn chất lượng";

    // Log admin action
    console.log(
      `Admin ${user.id} rejected review ${validatedData.reviewId}`,
      {
        reason: rejectionReason,
        user_email: profile?.email,
        product_name: product?.name,
      }
    );

    // TODO: Gửi email thông báo rejection
    // await sendRejectionNotification(profile?.email, product?.name, rejectionReason);

    return {
      success: true,
      message: `Đã từ chối đánh giá ${existingReview.rating} sao cho sản phẩm "${product?.name}" từ ${profile?.full_name}. Lý do: ${rejectionReason}`,
      review: existingReview,
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
      error: "Đã xảy ra lỗi không mong muốn khi từ chối đánh giá",
    };
  }
} 