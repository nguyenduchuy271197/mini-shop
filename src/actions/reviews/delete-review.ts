"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schema
const deleteReviewSchema = z.object({
  reviewId: z.number().positive("ID đánh giá không hợp lệ"),
});

type DeleteReviewData = z.infer<typeof deleteReviewSchema>;

// Return type
type DeleteReviewResult =
  | {
      success: true;
      message: string;
    }
  | { success: false; error: string };

export async function deleteReview(data: DeleteReviewData): Promise<DeleteReviewResult> {
  try {
    // 1. Validate input
    const { reviewId } = deleteReviewSchema.parse(data);

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
        error: "Bạn cần đăng nhập để xóa đánh giá",
      };
    }

    // 4. Get existing review and check ownership
    const { data: existingReview, error: fetchError } = await supabase
      .from("reviews")
      .select(`
        id,
        user_id,
        created_at,
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

    // 5. Check authorization - user can only delete their own reviews
    // or admin can delete any review
    let canDelete = false;
    
    if (existingReview.user_id === user.id) {
      canDelete = true;
    } else {
      // Check if user is admin
      const { data: userRole, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (!roleError && userRole && userRole.role === "admin") {
        canDelete = true;
      }
    }

    if (!canDelete) {
      return {
        success: false,
        error: "Bạn không có quyền xóa đánh giá này",
      };
    }

    // 6. Check if review can be deleted (within time limit for regular users)
    if (existingReview.user_id === user.id) {
      const reviewDate = new Date(existingReview.created_at);
      const now = new Date();
      const hoursSinceCreation = (now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60);
      
      // Allow deletion within 48 hours for users
      if (hoursSinceCreation > 48) {
        return {
          success: false,
          error: "Chỉ có thể xóa đánh giá trong vòng 48 giờ sau khi tạo",
        };
      }
    }

    // 7. Delete review
    const { error: deleteError } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId);

    if (deleteError) {
      return {
        success: false,
        error: deleteError.message || "Không thể xóa đánh giá",
      };
    }

    const productName = Array.isArray(existingReview.products) 
      ? existingReview.products[0]?.name 
      : existingReview.products?.name || "sản phẩm";

    return {
      success: true,
      message: `Đã xóa đánh giá cho "${productName}"`,
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
      error: "Đã xảy ra lỗi không mong muốn khi xóa đánh giá",
    };
  }
} 