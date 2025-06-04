"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schema
const voteHelpfulSchema = z.object({
  reviewId: z.number().positive("ID đánh giá không hợp lệ"),
  helpful: z.boolean(),
});

type VoteHelpfulData = z.infer<typeof voteHelpfulSchema>;

// Return type
type VoteHelpfulResult =
  | {
      success: true;
      message: string;
      helpfulCount: number;
    }
  | { success: false; error: string };

export async function voteReviewHelpful(data: VoteHelpfulData): Promise<VoteHelpfulResult> {
  try {
    // 1. Validate input
    const { reviewId, helpful } = voteHelpfulSchema.parse(data);

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
        error: "Bạn cần đăng nhập để đánh giá độ hữu ích",
      };
    }

    // 4. Get existing review
    const { data: existingReview, error: fetchError } = await supabase
      .from("reviews")
      .select("id, user_id, helpful_count, is_approved")
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

    // 5. Check if review is approved
    if (!existingReview.is_approved) {
      return {
        success: false,
        error: "Không thể đánh giá đánh giá chưa được duyệt",
      };
    }

    // 6. Prevent users from voting on their own reviews
    if (existingReview.user_id === user.id) {
      return {
        success: false,
        error: "Bạn không thể đánh giá độ hữu ích của đánh giá của chính mình",
      };
    }

    // 7. Since there's no review_votes table, we'll implement a simple system
    // where we increment/decrement the helpful_count based on the vote
    // Note: This is a simplified implementation. In a real system, you'd want
    // to track individual votes to prevent duplicate voting

    const currentCount = existingReview.helpful_count || 0;
    let newCount = currentCount;

    if (helpful) {
      newCount = currentCount + 1;
    } else {
      newCount = Math.max(0, currentCount - 1); // Prevent negative counts
    }

    // 8. Update helpful count
    const { data: updatedReview, error: updateError } = await supabase
      .from("reviews")
      .update({
        helpful_count: newCount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reviewId)
      .select("helpful_count")
      .single();

    if (updateError) {
      return {
        success: false,
        error: updateError.message || "Không thể cập nhật đánh giá độ hữu ích",
      };
    }

    if (!updatedReview) {
      return {
        success: false,
        error: "Không thể cập nhật đánh giá độ hữu ích",
      };
    }

    return {
      success: true,
      message: helpful 
        ? "Cảm ơn bạn đã đánh giá đánh giá này hữu ích!" 
        : "Cảm ơn phản hồi của bạn!",
      helpfulCount: updatedReview.helpful_count,
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
      error: "Đã xảy ra lỗi không mong muốn khi đánh giá độ hữu ích",
    };
  }
} 