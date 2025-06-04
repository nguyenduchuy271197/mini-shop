"use server";

import { createClient } from "@/lib/supabase/server";
import { Product, Category, Review, Profile } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const getProductDetailsSchema = z.object({
  productId: z.number().positive("ID sản phẩm không hợp lệ"),
});

type GetProductDetailsData = z.infer<typeof getProductDetailsSchema>;

// Extended product type with related data
type ProductDetails = Product & {
  category?: Pick<Category, "id" | "name" | "slug"> | null;
  reviews?: Array<Review & {
    profiles?: Pick<Profile, "id" | "full_name" | "avatar_url"> | null;
  }>;
  review_summary?: {
    total_reviews: number;
    average_rating: number;
    rating_distribution: Record<string, number>;
  };
};

// Return type
type GetProductDetailsResult =
  | { success: true; product: ProductDetails }
  | { success: false; error: string };

export async function getProductDetails(data: GetProductDetailsData): Promise<GetProductDetailsResult> {
  try {
    // 1. Validate input
    const { productId } = getProductDetailsSchema.parse(data);

    // 2. Create Supabase client
    const supabase = createClient();

    // 3. Get product with category
    const { data: product, error: productError } = await supabase
      .from("products")
      .select(`
        *,
        category:categories (
          id,
          name,
          slug
        )
      `)
      .eq("id", productId)
      .eq("is_active", true)
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
        error: productError.message || "Không thể lấy thông tin sản phẩm",
      };
    }

    if (!product) {
      return {
        success: false,
        error: "Không tìm thấy sản phẩm",
      };
    }

    // 4. Get approved reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(10);

    if (reviewsError) {
      console.error("Error fetching reviews:", reviewsError);
    }

    // 5. Get user profiles for reviews if reviews exist
    let reviewsWithProfiles: Array<Review & {
      profiles?: Pick<Profile, "id" | "full_name" | "avatar_url"> | null;
    }> = [];
    
    if (reviews && reviews.length > 0) {
      const userIds = reviews.map(review => review.user_id);
      
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
      }

      // Combine reviews with profiles
      reviewsWithProfiles = reviews.map(review => {
        const userProfile = profiles?.find(profile => profile.id === review.user_id) || null;
        return {
          ...review,
          profiles: userProfile,
        };
      });
    }

    // 6. Calculate review summary
    let review_summary = undefined;
    if (reviewsWithProfiles.length > 0) {
      const total_reviews = reviewsWithProfiles.length;
      const average_rating = reviewsWithProfiles.reduce((sum, review) => sum + review.rating, 0) / total_reviews;
      
      const rating_distribution = reviewsWithProfiles.reduce((acc, review) => {
        const rating = review.rating.toString();
        acc[rating] = (acc[rating] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      review_summary = {
        total_reviews,
        average_rating: Math.round(average_rating * 10) / 10,
        rating_distribution,
      };
    }

    // 7. Combine all data
    const productDetails: ProductDetails = {
      ...product,
      reviews: reviewsWithProfiles,
      review_summary,
    };

    return {
      success: true,
      product: productDetails,
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
      error: "Đã xảy ra lỗi không mong muốn khi lấy thông tin sản phẩm",
    };
  }
} 