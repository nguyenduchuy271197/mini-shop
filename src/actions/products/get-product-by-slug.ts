"use server";

import { createClient } from "@/lib/supabase/server";
import { Product, Category } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const getProductBySlugSchema = z.object({
  slug: z.string().min(1, "Slug không được để trống"),
});

type GetProductBySlugData = z.infer<typeof getProductBySlugSchema>;

// Extended product type with category info
type ProductWithCategory = Product & {
  category?: Pick<Category, "id" | "name" | "slug"> | null;
};

// Return type
type GetProductBySlugResult =
  | { success: true; product: ProductWithCategory }
  | { success: false; error: string };

export async function getProductBySlug(data: GetProductBySlugData): Promise<GetProductBySlugResult> {
  try {
    // 1. Validate input
    const { slug } = getProductBySlugSchema.parse(data);

    // 2. Create Supabase client
    const supabase = createClient();

    // 3. Get product by slug with category
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
      .eq("slug", slug)
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

    return {
      success: true,
      product,
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