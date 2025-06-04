"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schema
const approveReviewSchema = z.object({
  reviewId: z.number().int().positive("ID đánh giá không hợp lệ"),
});

type ApproveReviewResult =
  | { success: true; message: string; review: {
      id: number;
      title: string | null;
      comment: string | null;
      rating: number;
      is_approved: boolean;
      is_verified: boolean;
      helpful_count: number;
      created_at: string;
      updated_at: string;
      user_id: string;
      product_id: number;
    } }
  | { success: false; error: string };

export async function approveReview(
  reviewId: number
): Promise<ApproveReviewResult> {
  try {
    // Validate input
    const validatedData = approveReviewSchema.parse({ reviewId });

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

    // Kiểm tra authorization - chỉ admin mới có thể approve reviews
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || userRole?.role !== "admin") {
      return {
        success: false,
        error: "Chỉ admin mới có thể phê duyệt đánh giá",
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

    // Kiểm tra review đã được approve chưa
    if (existingReview.is_approved) {
      return {
        success: false,
        error: "Đánh giá này đã được phê duyệt từ trước",
      };
    }

    // Lấy thông tin user và product
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", existingReview.user_id)
      .single();

    const { data: product } = await supabase
      .from("products")
      .select("name")
      .eq("id", existingReview.product_id)
      .single();

    // Approve review
    const { data: updatedReview, error: updateError } = await supabase
      .from("reviews")
      .update({
        is_approved: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", validatedData.reviewId)
      .select(`
        id,
        title,
        comment,
        rating,
        is_approved,
        is_verified,
        helpful_count,
        created_at,
        updated_at,
        user_id,
        product_id
      `)
      .single();

    if (updateError) {
      return {
        success: false,
        error: "Lỗi khi phê duyệt đánh giá",
      };
    }

    // Log admin action (optional - có thể thêm audit log table sau)
    console.log(`Admin ${user.id} approved review ${validatedData.reviewId}`);

    return {
      success: true,
      message: `Đã phê duyệt đánh giá ${existingReview.rating} sao cho sản phẩm "${product?.name}" từ ${profile?.full_name}`,
      review: updatedReview,
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
      error: "Đã xảy ra lỗi không mong muốn khi phê duyệt đánh giá",
    };
  }
} 