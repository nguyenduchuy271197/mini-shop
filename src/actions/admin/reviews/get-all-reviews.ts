"use server";

import { createClient } from "@/lib/supabase/server";
import { PaginationParams } from "@/types/custom.types";
import { z } from "zod";

// Validation schema cho filters
const reviewFiltersSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  is_approved: z.boolean().optional(),
  is_verified: z.boolean().optional(),
  product_id: z.number().int().positive().optional(),
  user_id: z.string().uuid().optional(),
  search: z.string().optional(),
}).optional();

type ReviewFilters = z.infer<typeof reviewFiltersSchema>;

type ReviewWithDetails = {
  id: number;
  user_id: string;
  product_id: number;
  order_id: number | null;
  rating: number;
  title: string | null;
  comment: string | null;
  is_verified: boolean;
  is_approved: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  user: {
    full_name: string;
    email: string;
  } | null;
  product: {
    name: string;
    sku: string | null;
  } | null;
};

type GetAllReviewsResult =
  | {
      success: true;
      reviews: ReviewWithDetails[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
      stats: {
        total: number;
        approved: number;
        pending: number;
        verified: number;
        averageRating: number;
      };
    }
  | { success: false; error: string };

export async function getAllReviews(
  pagination: PaginationParams,
  filters?: ReviewFilters
): Promise<GetAllReviewsResult> {
  try {
    // Validate input
    const validatedFilters = reviewFiltersSchema.parse(filters);

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

    // Kiểm tra authorization - chỉ admin mới có thể xem tất cả reviews
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || userRole?.role !== "admin") {
      return {
        success: false,
        error: "Chỉ admin mới có thể xem tất cả đánh giá",
      };
    }

    // Thiết lập pagination
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const offset = (page - 1) * limit;

    // Build query cơ bản
    let query = supabase
      .from("reviews")
      .select(
        `
        id,
        user_id,
        product_id,
        order_id,
        rating,
        title,
        comment,
        is_verified,
        is_approved,
        helpful_count,
        created_at,
        updated_at
      `,
        { count: "exact" }
      );

    // Apply filters
    if (validatedFilters) {
      if (validatedFilters.rating !== undefined) {
        query = query.eq("rating", validatedFilters.rating);
      }
      if (validatedFilters.is_approved !== undefined) {
        query = query.eq("is_approved", validatedFilters.is_approved);
      }
      if (validatedFilters.is_verified !== undefined) {
        query = query.eq("is_verified", validatedFilters.is_verified);
      }
      if (validatedFilters.product_id !== undefined) {
        query = query.eq("product_id", validatedFilters.product_id);
      }
      if (validatedFilters.user_id !== undefined) {
        query = query.eq("user_id", validatedFilters.user_id);
      }
      if (validatedFilters.search) {
        query = query.or(
          `title.ilike.%${validatedFilters.search}%,comment.ilike.%${validatedFilters.search}%`
        );
      }
    }

    // Apply pagination và sorting
    const { data: reviews, error: reviewsError, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (reviewsError) {
      return {
        success: false,
        error: "Lỗi khi lấy danh sách đánh giá",
      };
    }

    if (!reviews) {
      return {
        success: true,
        reviews: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
        stats: {
          total: 0,
          approved: 0,
          pending: 0,
          verified: 0,
          averageRating: 0,
        },
      };
    }

    // Lấy user profiles riêng
    const userIds = Array.from(new Set(reviews.map(r => r.user_id)));
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", userIds);

    // Lấy product info riêng
    const productIds = Array.from(new Set(reviews.map(r => r.product_id)));
    const { data: products } = await supabase
      .from("products")
      .select("id, name, sku")
      .in("id", productIds);

    // Map profiles và products
    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
    const productMap = new Map(products?.map(p => [p.id, p]) || []);

    // Calculate stats từ tất cả reviews
    const { data: allReviews } = await supabase
      .from("reviews")
      .select("is_approved, is_verified, rating");

    const stats = {
      total: count || 0,
      approved: 0,
      pending: 0,
      verified: 0,
      averageRating: 0,
    };

    if (allReviews && allReviews.length > 0) {
      stats.approved = allReviews.filter((r) => r.is_approved).length;
      stats.pending = allReviews.filter((r) => !r.is_approved).length;
      stats.verified = allReviews.filter((r) => r.is_verified).length;
      stats.averageRating = 
        allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    // Transform data
    const transformedReviews: ReviewWithDetails[] = reviews.map((review) => {
      const userProfile = profileMap.get(review.user_id);
      const productInfo = productMap.get(review.product_id);
      
      return {
        id: review.id,
        user_id: review.user_id,
        product_id: review.product_id,
        order_id: review.order_id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        is_verified: review.is_verified,
        is_approved: review.is_approved,
        helpful_count: review.helpful_count,
        created_at: review.created_at,
        updated_at: review.updated_at,
        user: userProfile ? {
          full_name: userProfile.full_name || "",
          email: userProfile.email,
        } : null,
        product: productInfo || null,
      };
    });

    return {
      success: true,
      reviews: transformedReviews,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      stats,
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