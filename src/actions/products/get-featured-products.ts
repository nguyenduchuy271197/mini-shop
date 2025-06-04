"use server";

import { createClient } from "@/lib/supabase/server";
import { Product, Category } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const getFeaturedProductsSchema = z.object({
  limit: z.number().min(1).max(50).optional().default(12),
});

type GetFeaturedProductsData = z.infer<typeof getFeaturedProductsSchema>;

// Extended product type with category info
type ProductWithCategory = Product & {
  category?: Pick<Category, "id" | "name" | "slug"> | null;
};

// Return type
type GetFeaturedProductsResult =
  | { success: true; products: ProductWithCategory[] }
  | { success: false; error: string };

export async function getFeaturedProducts(data?: GetFeaturedProductsData): Promise<GetFeaturedProductsResult> {
  try {
    // 1. Validate input
    const { limit } = data ? getFeaturedProductsSchema.parse(data) : { limit: 12 };

    // 2. Create Supabase client
    const supabase = createClient();

    // 3. Get featured products with category
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select(`
        *,
        category:categories (
          id,
          name,
          slug
        )
      `)
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (productsError) {
      return {
        success: false,
        error: productsError.message || "Không thể lấy danh sách sản phẩm nổi bật",
      };
    }

    if (!products) {
      return {
        success: false,
        error: "Không tìm thấy sản phẩm nổi bật",
      };
    }

    return {
      success: true,
      products,
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
      error: "Đã xảy ra lỗi không mong muốn khi lấy sản phẩm nổi bật",
    };
  }
} 