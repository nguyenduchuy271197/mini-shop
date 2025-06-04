"use server";

import { createClient } from "@/lib/supabase/server";
import { Product, Category } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const getRelatedProductsSchema = z.object({
  productId: z.number().positive("ID sản phẩm không hợp lệ"),
  limit: z.number().min(1).max(20).optional().default(8),
});

type GetRelatedProductsData = z.infer<typeof getRelatedProductsSchema>;

// Extended product type with category info
type ProductWithCategory = Product & {
  category?: Pick<Category, "id" | "name" | "slug"> | null;
};

// Return type
type GetRelatedProductsResult =
  | { success: true; products: ProductWithCategory[] }
  | { success: false; error: string };

export async function getRelatedProducts(data: GetRelatedProductsData): Promise<GetRelatedProductsResult> {
  try {
    // 1. Validate input
    const { productId, limit } = getRelatedProductsSchema.parse(data);

    // 2. Create Supabase client
    const supabase = createClient();

    // 3. First, get the current product to find its category and tags
    const { data: currentProduct, error: currentProductError } = await supabase
      .from("products")
      .select("category_id, tags, brand")
      .eq("id", productId)
      .single();

    if (currentProductError) {
      return {
        success: false,
        error: "Không tìm thấy sản phẩm để lấy sản phẩm liên quan",
      };
    }

    if (!currentProduct) {
      return {
        success: false,
        error: "Không tìm thấy sản phẩm",
      };
    }

    // 4. Build query for related products
    let query = supabase
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
      .neq("id", productId) // Exclude current product
      .limit(limit);

    // Priority 1: Same category
    if (currentProduct.category_id) {
      query = query.eq("category_id", currentProduct.category_id);
    }

    const { data: sameCategoryProducts } = await query;

    let relatedProducts: ProductWithCategory[] = sameCategoryProducts || [];

    // If we don't have enough products from the same category, get more from same brand or similar tags
    if (relatedProducts.length < limit) {
      const remainingLimit = limit - relatedProducts.length;
      const excludeIds = [productId, ...relatedProducts.map(p => p.id)];

      // Priority 2: Same brand
      if (currentProduct.brand) {
        const { data: sameBrandProducts, error: brandError } = await supabase
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
          .eq("brand", currentProduct.brand)
          .not("id", "in", `(${excludeIds.join(",")})`)
          .limit(remainingLimit);

        if (!brandError && sameBrandProducts) {
          relatedProducts = [...relatedProducts, ...sameBrandProducts];
        }
      }

      // Priority 3: Similar tags
      if (relatedProducts.length < limit && currentProduct.tags && currentProduct.tags.length > 0) {
        const finalRemainingLimit = limit - relatedProducts.length;
        const finalExcludeIds = [productId, ...relatedProducts.map(p => p.id)];

        const { data: similarTagsProducts, error: tagsError } = await supabase
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
          .overlaps("tags", currentProduct.tags)
          .not("id", "in", `(${finalExcludeIds.join(",")})`)
          .limit(finalRemainingLimit);

        if (!tagsError && similarTagsProducts) {
          relatedProducts = [...relatedProducts, ...similarTagsProducts];
        }
      }

      // Priority 4: Random active products if still not enough
      if (relatedProducts.length < limit) {
        const finalRemainingLimit = limit - relatedProducts.length;
        const finalExcludeIds = [productId, ...relatedProducts.map(p => p.id)];

        const { data: randomProducts, error: randomError } = await supabase
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
          .not("id", "in", `(${finalExcludeIds.join(",")})`)
          .order("created_at", { ascending: false })
          .limit(finalRemainingLimit);

        if (!randomError && randomProducts) {
          relatedProducts = [...relatedProducts, ...randomProducts];
        }
      }
    }

    // Limit the final result
    const finalProducts = relatedProducts.slice(0, limit);

    return {
      success: true,
      products: finalProducts,
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
      error: "Đã xảy ra lỗi không mong muốn khi lấy sản phẩm liên quan",
    };
  }
} 