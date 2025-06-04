"use server";

import { createClient } from "@/lib/supabase/server";
import { Review, Profile } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const getProductReviewsSchema = z.object({
  productId: z.number().positive("ID sản phẩm không hợp lệ"),
  page: z.number().positive("Trang phải là số dương").optional().default(1),
  limit: z.number().positive("Giới hạn phải là số dương").max(50, "Giới hạn tối đa là 50").optional().default(10),
  sortBy: z.enum(["newest", "oldest", "rating_high", "rating_low", "helpful"]).optional().default("newest"),
  onlyApproved: z.boolean().optional().default(true),
});

type GetProductReviewsData = z.infer<typeof getProductReviewsSchema>;

// Extended review type with user profile
type ReviewWithProfile = Review & {
  profiles: Pick<Profile, "id" | "full_name" | "avatar_url"> | null;
};

// Return type
type GetProductReviewsResult =
  | {
      success: true;
      reviews: ReviewWithProfile[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
      summary: {
        averageRating: number;
        totalReviews: number;
        ratingDistribution: Record<string, number>;
      };
    }
  | { success: false; error: string };

export async function getProductReviews(data: GetProductReviewsData): Promise<GetProductReviewsResult> {
  try {
    // 1. Validate input
    const { productId, page, limit, sortBy, onlyApproved } = getProductReviewsSchema.parse(data);

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

    // 4. Build base query
    let baseQuery = supabase
      .from("reviews")
      .select("*", { count: "exact" })
      .eq("product_id", productId);

    if (onlyApproved) {
      baseQuery = baseQuery.eq("is_approved", true);
    }

    // 5. Get total count for pagination
    const { count: totalCount, error: countError } = await baseQuery;

    if (countError) {
      return {
        success: false,
        error: countError.message || "Không thể đếm số lượng đánh giá",
      };
    }

    const total = totalCount || 0;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    // 6. Build sort order
    let orderBy: { column: string; ascending: boolean } = { column: "created_at", ascending: false };
    
    switch (sortBy) {
      case "newest":
        orderBy = { column: "created_at", ascending: false };
        break;
      case "oldest":
        orderBy = { column: "created_at", ascending: true };
        break;
      case "rating_high":
        orderBy = { column: "rating", ascending: false };
        break;
      case "rating_low":
        orderBy = { column: "rating", ascending: true };
        break;
      case "helpful":
        orderBy = { column: "helpful_count", ascending: false };
        break;
    }

    // 7. Get reviews
    let reviewQuery = supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .order(orderBy.column, { ascending: orderBy.ascending })
      .range(offset, offset + limit - 1);

    if (onlyApproved) {
      reviewQuery = reviewQuery.eq("is_approved", true);
    }

    const { data: reviews, error: reviewsError } = await reviewQuery;

    if (reviewsError) {
      return {
        success: false,
        error: reviewsError.message || "Không thể lấy danh sách đánh giá",
      };
    }

    if (!reviews || reviews.length === 0) {
      return {
        success: true,
        reviews: [],
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: false,
          hasPrev: false,
        },
        summary: {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: {},
        },
      };
    }

    // 8. Get user profiles for the reviews
    const userIds = reviews.map(review => review.user_id);
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", userIds);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
    }

    // 9. Combine reviews with profiles
    const reviewsWithProfiles: ReviewWithProfile[] = reviews.map(review => {
      const userProfile = profiles?.find(profile => profile.id === review.user_id) || null;
      return {
        ...review,
        profiles: userProfile,
      };
    });

    // 10. Calculate summary statistics
    const { data: allReviews, error: summaryError } = await supabase
      .from("reviews")
      .select("rating")
      .eq("product_id", productId)
      .eq("is_approved", true);

    let summary = {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: {} as Record<string, number>,
    };

    if (!summaryError && allReviews && allReviews.length > 0) {
      const totalReviews = allReviews.length;
      const averageRating = allReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
      
      const ratingDistribution = allReviews.reduce((acc, review) => {
        const rating = review.rating.toString();
        acc[rating] = (acc[rating] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      summary = {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
        ratingDistribution,
      };
    }

    // 11. Calculate pagination info
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      success: true,
      reviews: reviewsWithProfiles,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
      summary,
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
      error: "Đã xảy ra lỗi không mong muốn khi lấy danh sách đánh giá",
    };
  }
} 