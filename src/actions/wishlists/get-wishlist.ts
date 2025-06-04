"use server";

import { createClient } from "@/lib/supabase/server";
import { Wishlist, Product } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const getWishlistSchema = z.object({
  page: z.number().positive("Trang phải là số dương").optional().default(1),
  limit: z.number().positive("Giới hạn phải là số dương").max(100, "Giới hạn tối đa là 100").optional().default(20),
});

type GetWishlistData = z.infer<typeof getWishlistSchema>;

// Extended wishlist type with product details
type WishlistWithProduct = Wishlist & {
  products: Pick<Product, "id" | "name" | "slug" | "price" | "compare_price" | "images" | "is_active" | "stock_quantity"> | null;
};

// Return type
type GetWishlistResult =
  | {
      success: true;
      wishlist: WishlistWithProduct[];
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

export async function getWishlist(data?: GetWishlistData): Promise<GetWishlistResult> {
  try {
    // 1. Validate input
    const validatedData = getWishlistSchema.parse(data || {});
    const { page, limit } = validatedData;

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
        error: "Bạn cần đăng nhập để xem danh sách yêu thích",
      };
    }

    // 4. Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from("wishlists")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (countError) {
      return {
        success: false,
        error: countError.message || "Không thể đếm số lượng sản phẩm trong danh sách yêu thích",
      };
    }

    const total = totalCount || 0;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    // 5. Get wishlist items with product details
    const { data: wishlistItems, error: wishlistError } = await supabase
      .from("wishlists")
      .select(`
        *,
        products!inner (
          id,
          name,
          slug,
          price,
          compare_price,
          images,
          is_active,
          stock_quantity
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (wishlistError) {
      return {
        success: false,
        error: wishlistError.message || "Không thể lấy danh sách yêu thích",
      };
    }

    if (!wishlistItems) {
      return {
        success: true,
        wishlist: [],
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

    // 6. Filter out items with inactive products and format data
    const activeWishlistItems = wishlistItems.filter(item => {
      const product = Array.isArray(item.products) ? item.products[0] : item.products;
      return product && product.is_active;
    });

    // 7. Calculate pagination info
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      success: true,
      wishlist: activeWishlistItems as WishlistWithProduct[],
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
      error: "Đã xảy ra lỗi không mong muốn khi lấy danh sách yêu thích",
    };
  }
} 