"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schema
const getReviewSummarySchema = z.object({
  productId: z.number().positive("ID sản phẩm không hợp lệ"),
});

type GetReviewSummaryData = z.infer<typeof getReviewSummarySchema>;

// Return type
type GetReviewSummaryResult =
  | {
      success: true;
      summary: {
        productId: number;
        averageRating: number;
        totalReviews: number;
        approvedReviews: number;
        pendingReviews: number;
        ratingDistribution: {
          1: number;
          2: number;
          3: number;
          4: number;
          5: number;
        };
        percentageDistribution: {
          1: number;
          2: number;
          3: number;
          4: number;
          5: number;
        };
        verifiedPurchases: number;
        helpfulVotes: number;
        latestReviews: Array<{
          id: number;
          rating: number;
          title: string | null;
          comment: string | null;
          created_at: string;
          is_verified: boolean;
          user_name: string;
        }>;
      };
    }
  | { success: false; error: string };

export async function getProductReviewSummary(data: GetReviewSummaryData): Promise<GetReviewSummaryResult> {
  try {
    // 1. Validate input
    const { productId } = getReviewSummarySchema.parse(data);

    // 2. Create Supabase client
    const supabase = createClient();

    // 3. Check if product exists
    const { error: productError } = await supabase
      .from("products")
      .select("id, name")
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

    // 4. Get all reviews for the product
    const { data: allReviews, error: reviewsError } = await supabase
      .from("reviews")
      .select("id, rating, is_approved, is_verified, helpful_count")
      .eq("product_id", productId);

    if (reviewsError) {
      return {
        success: false,
        error: reviewsError.message || "Không thể lấy thông tin đánh giá",
      };
    }

    const reviews = allReviews || [];
    const approvedReviews = reviews.filter(r => r.is_approved);
    const pendingReviews = reviews.filter(r => !r.is_approved);
    const verifiedReviews = reviews.filter(r => r.is_verified);

    // 5. Calculate rating statistics
    const totalReviews = reviews.length;
    const approvedCount = approvedReviews.length;
    const pendingCount = pendingReviews.length;
    const verifiedCount = verifiedReviews.length;

    // Calculate average rating (only approved reviews)
    const averageRating = approvedCount > 0 
      ? approvedReviews.reduce((sum, review) => sum + review.rating, 0) / approvedCount
      : 0;

    // Calculate rating distribution (only approved reviews)
    const ratingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    approvedReviews.forEach(review => {
      const rating = review.rating as keyof typeof ratingDistribution;
      ratingDistribution[rating]++;
    });

    // Calculate percentage distribution
    const percentageDistribution = {
      1: approvedCount > 0 ? Math.round((ratingDistribution[1] / approvedCount) * 100) : 0,
      2: approvedCount > 0 ? Math.round((ratingDistribution[2] / approvedCount) * 100) : 0,
      3: approvedCount > 0 ? Math.round((ratingDistribution[3] / approvedCount) * 100) : 0,
      4: approvedCount > 0 ? Math.round((ratingDistribution[4] / approvedCount) * 100) : 0,
      5: approvedCount > 0 ? Math.round((ratingDistribution[5] / approvedCount) * 100) : 0,
    };

    // Calculate total helpful votes
    const helpfulVotes = reviews.reduce((sum, review) => sum + (review.helpful_count || 0), 0);

    // 6. Get latest approved reviews
    const { data: latestReviewsData, error: latestError } = await supabase
      .from("reviews")
      .select("id, rating, title, comment, created_at, is_verified, user_id")
      .eq("product_id", productId)
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(5);

    if (latestError) {
      console.error("Error fetching latest reviews:", latestError);
    }

    let latestReviews: Array<{
      id: number;
      rating: number;
      title: string | null;
      comment: string | null;
      created_at: string;
      is_verified: boolean;
      user_name: string;
    }> = [];

    if (latestReviewsData && latestReviewsData.length > 0) {
      // Get user profiles for latest reviews
      const latestUserIds = latestReviewsData.map(review => review.user_id);
      const { data: latestProfiles, error: latestProfilesError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", latestUserIds);

      if (latestProfilesError) {
        console.error("Error fetching latest profiles:", latestProfilesError);
      }

      latestReviews = latestReviewsData.map(review => ({
        id: review.id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        created_at: review.created_at,
        is_verified: review.is_verified,
        user_name: latestProfiles?.find(p => p.id === review.user_id)?.full_name || "Người dùng ẩn danh",
      }));
    }

    return {
      success: true,
      summary: {
        productId,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
        approvedReviews: approvedCount,
        pendingReviews: pendingCount,
        ratingDistribution,
        percentageDistribution,
        verifiedPurchases: verifiedCount,
        helpfulVotes,
        latestReviews,
      },
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
      error: "Đã xảy ra lỗi không mong muốn khi lấy tóm tắt đánh giá",
    };
  }
} 