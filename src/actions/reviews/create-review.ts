"use server";

import { createClient } from "@/lib/supabase/server";
import { Review } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const createReviewSchema = z.object({
  productId: z.number().positive("ID sản phẩm không hợp lệ"),
  orderId: z.number().positive("ID đơn hàng không hợp lệ").optional(),
  rating: z.number().min(1, "Đánh giá phải từ 1 sao").max(5, "Đánh giá tối đa 5 sao"),
  title: z.string().min(5, "Tiêu đề phải có ít nhất 5 ký tự").max(200, "Tiêu đề tối đa 200 ký tự").optional(),
  comment: z.string().min(10, "Nhận xét phải có ít nhất 10 ký tự").max(1000, "Nhận xét tối đa 1000 ký tự"),
});

type CreateReviewData = z.infer<typeof createReviewSchema>;

// Return type
type CreateReviewResult =
  | {
      success: true;
      message: string;
      review: Review;
    }
  | { success: false; error: string };

export async function createReview(data: CreateReviewData): Promise<CreateReviewResult> {
  try {
    // 1. Validate input
    const { productId, orderId, rating, title, comment } = createReviewSchema.parse(data);

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
        error: "Bạn cần đăng nhập để đánh giá sản phẩm",
      };
    }

    // 4. Check if product exists and is active
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name, is_active")
      .eq("id", productId)
      .single();

    if (productError) {
      if (productError.code === "PGRST116") {
        return {
          success: false,
          error: "Không tìm thấy sản phẩm",
        };
      }
      return {
        success: false,
        error: productError.message || "Không thể kiểm tra sản phẩm",
      };
    }

    if (!product.is_active) {
      return {
        success: false,
        error: "Không thể đánh giá sản phẩm này",
      };
    }

    // 5. Check if user already reviewed this product
    const { data: existingReview, error: checkError } = await supabase
      .from("reviews")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      return {
        success: false,
        error: checkError.message || "Không thể kiểm tra đánh giá hiện có",
      };
    }

    if (existingReview) {
      return {
        success: false,
        error: "Bạn đã đánh giá sản phẩm này rồi",
      };
    }

    // 6. Verify purchase if orderId provided
    let isVerified = false;
    if (orderId) {
      const { data: orderItem, error: orderError } = await supabase
        .from("order_items")
        .select(`
          id,
          orders!inner (
            id,
            user_id,
            status
          )
        `)
        .eq("product_id", productId)
        .eq("orders.user_id", user.id)
        .eq("orders.id", orderId)
        .in("orders.status", ["delivered", "completed"])
        .single();

      if (!orderError && orderItem) {
        isVerified = true;
      }
    }

    // 7. Create review
    const reviewData = {
      user_id: user.id,
      product_id: productId,
      order_id: orderId || null,
      rating,
      title: title || null,
      comment,
      is_verified: isVerified,
      is_approved: false, // Requires admin approval
      helpful_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: newReview, error: insertError } = await supabase
      .from("reviews")
      .insert(reviewData)
      .select()
      .single();

    if (insertError) {
      return {
        success: false,
        error: insertError.message || "Không thể tạo đánh giá",
      };
    }

    if (!newReview) {
      return {
        success: false,
        error: "Không thể tạo đánh giá",
      };
    }

    return {
      success: true,
      message: `Cảm ơn bạn đã đánh giá "${product.name}". Đánh giá sẽ được hiển thị sau khi được duyệt.`,
      review: newReview,
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
      error: "Đã xảy ra lỗi không mong muốn khi tạo đánh giá",
    };
  }
} 