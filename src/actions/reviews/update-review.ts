"use server";

import { createClient } from "@/lib/supabase/server";
import { Review } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const updateReviewSchema = z.object({
  reviewId: z.number().positive("ID đánh giá không hợp lệ"),
  rating: z.number().min(1, "Đánh giá phải từ 1 sao").max(5, "Đánh giá tối đa 5 sao").optional(),
  title: z.string().min(5, "Tiêu đề phải có ít nhất 5 ký tự").max(200, "Tiêu đề tối đa 200 ký tự").optional(),
  comment: z.string().min(10, "Nhận xét phải có ít nhất 10 ký tự").max(1000, "Nhận xét tối đa 1000 ký tự").optional(),
});

type UpdateReviewData = z.infer<typeof updateReviewSchema>;

// Return type
type UpdateReviewResult =
  | {
      success: true;
      message: string;
      review: Review;
    }
  | { success: false; error: string };

export async function updateReview(data: UpdateReviewData): Promise<UpdateReviewResult> {
  try {
    // 1. Validate input
    const { reviewId, ...updateFields } = updateReviewSchema.parse(data);

    // Check if there are fields to update
    if (Object.keys(updateFields).length === 0) {
      return {
        success: false,
        error: "Không có thông tin nào để cập nhật",
      };
    }

    // 2. Create Supabase client
    const supabase = createClient();

    // 3. Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "Bạn cần đăng nhập để cập nhật đánh giá",
      };
    }

    // 4. Get existing review and check ownership
    const { data: existingReview, error: fetchError } = await supabase
      .from("reviews")
      .select(`
        *,
        products!inner (
          id,
          name
        )
      `)
      .eq("id", reviewId)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return {
          success: false,
          error: "Không tìm thấy đánh giá",
        };
      }
      return {
        success: false,
        error: fetchError.message || "Không thể lấy thông tin đánh giá",
      };
    }

    if (!existingReview) {
      return {
        success: false,
        error: "Không tìm thấy đánh giá",
      };
    }

    // 5. Check authorization - user can only update their own reviews
    if (existingReview.user_id !== user.id) {
      return {
        success: false,
        error: "Bạn không có quyền cập nhật đánh giá này",
      };
    }

    // 6. Check if review can be updated (within time limit or not yet approved)
    const reviewDate = new Date(existingReview.created_at);
    const now = new Date();
    const hoursSinceCreation = (now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60);
    
    // Allow updates within 24 hours or if not yet approved
    if (hoursSinceCreation > 24 && existingReview.is_approved) {
      return {
        success: false,
        error: "Chỉ có thể chỉnh sửa đánh giá trong vòng 24 giờ hoặc khi chưa được duyệt",
      };
    }

    // 7. Prepare update data
    const updateData: Record<string, string | number | boolean | null> = {
      updated_at: new Date().toISOString(),
    };

    // Add only the fields that are being updated
    if (updateFields.rating !== undefined) updateData.rating = updateFields.rating;
    if (updateFields.title !== undefined) updateData.title = updateFields.title || null;
    if (updateFields.comment !== undefined) updateData.comment = updateFields.comment;

    // If content changed, reset approval status
    if (updateFields.rating !== undefined || updateFields.title !== undefined || updateFields.comment !== undefined) {
      updateData.is_approved = false;
    }

    // 8. Update review
    const { data: updatedReview, error: updateError } = await supabase
      .from("reviews")
      .update(updateData)
      .eq("id", reviewId)
      .select()
      .single();

    if (updateError) {
      return {
        success: false,
        error: updateError.message || "Không thể cập nhật đánh giá",
      };
    }

    if (!updatedReview) {
      return {
        success: false,
        error: "Không thể cập nhật đánh giá",
      };
    }

    const productName = Array.isArray(existingReview.products) 
      ? existingReview.products[0]?.name 
      : existingReview.products?.name || "sản phẩm";

    return {
      success: true,
      message: `Đã cập nhật đánh giá cho "${productName}". Đánh giá sẽ được duyệt lại.`,
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
      error: "Đã xảy ra lỗi không mong muốn khi cập nhật đánh giá",
    };
  }
} 