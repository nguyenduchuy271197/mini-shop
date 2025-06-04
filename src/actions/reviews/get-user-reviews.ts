"use server";

import { createClient } from "@/lib/supabase/server";
import { Review, Product } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const getUserReviewsSchema = z.object({
  userId: z.string().uuid("ID người dùng không hợp lệ").optional(),
  page: z.number().positive("Trang phải là số dương").optional().default(1),
  limit: z.number().positive("Giới hạn phải là số dương").max(50, "Giới hạn tối đa là 50").optional().default(10),
  sortBy: z.enum(["newest", "oldest", "rating_high", "rating_low"]).optional().default("newest"),
});

type GetUserReviewsData = z.infer<typeof getUserReviewsSchema>;

// Extended review type with product details
type ReviewWithProduct = Review & {
  products: Pick<Product, "id" | "name" | "slug" | "images"> | null;
};

// Return type
type GetUserReviewsResult =
  | {
      success: true;
      reviews: ReviewWithProduct[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    }
  | { success: false; error: string };

export async function getUserReviews(data?: GetUserReviewsData): Promise<GetUserReviewsResult> {
  try {
    // 1. Validate input
    const validatedData = getUserReviewsSchema.parse(data || {});
    const { userId, page, limit, sortBy } = validatedData;

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
        error: "Bạn cần đăng nhập để xem danh sách đánh giá",
      };
    }

    // 4. Determine target user ID
    const targetUserId = userId || user.id;

    // 5. Check authorization - users can only view their own reviews unless admin
    if (targetUserId !== user.id) {
      const { data: userRole, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (roleError || !userRole || userRole.role !== "admin") {
        return {
          success: false,
          error: "Bạn không có quyền xem đánh giá của người dùng khác",
        };
      }
    }

    // 6. Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from("reviews")
      .select("*", { count: "exact", head: true })
      .eq("user_id", targetUserId);

    if (countError) {
      return {
        success: false,
        error: countError.message || "Không thể đếm số lượng đánh giá",
      };
    }

    const total = totalCount || 0;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    // 7. Build sort order
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
    }

    // 8. Get reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from("reviews")
      .select("*")
      .eq("user_id", targetUserId)
      .order(orderBy.column, { ascending: orderBy.ascending })
      .range(offset, offset + limit - 1);

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
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }

    // 9. Get product details for the reviews
    const productIds = reviews.map(review => review.product_id);
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, slug, images")
      .in("id", productIds);

    if (productsError) {
      console.error("Error fetching products:", productsError);
    }

    // 10. Combine reviews with products
    const reviewsWithProducts: ReviewWithProduct[] = reviews.map(review => {
      const product = products?.find(p => p.id === review.product_id) || null;
      return {
        ...review,
        products: product,
      };
    });

    // 11. Calculate pagination info
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      success: true,
      reviews: reviewsWithProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
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
      error: "Đã xảy ra lỗi không mong muốn khi lấy danh sách đánh giá",
    };
  }
} 