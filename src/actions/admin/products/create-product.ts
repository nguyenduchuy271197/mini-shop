"use server";

import { createClient } from "@/lib/supabase/server";
import { Product } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const createProductSchema = z.object({
  name: z.string().min(3, "Tên sản phẩm phải có ít nhất 3 ký tự").max(255, "Tên sản phẩm tối đa 255 ký tự"),
  slug: z.string().min(3, "Slug phải có ít nhất 3 ký tự").max(255, "Slug tối đa 255 ký tự").regex(/^[a-z0-9-]+$/, "Slug chỉ được chứa chữ thường, số và dấu gạch ngang"),
  description: z.string().optional(),
  shortDescription: z.string().max(500, "Mô tả ngắn tối đa 500 ký tự").optional(),
  sku: z.string().optional(),
  price: z.number().positive("Giá phải lớn hơn 0"),
  comparePrice: z.number().positive("Giá so sánh phải lớn hơn 0").optional(),
  costPrice: z.number().positive("Giá gốc phải lớn hơn 0").optional(),
  stockQuantity: z.number().int().min(0, "Số lượng tồn kho không thể âm").optional().default(0),
  lowStockThreshold: z.number().int().min(0, "Ngưỡng tồn kho thấp không thể âm").optional().default(10),
  categoryId: z.number().positive("ID danh mục không hợp lệ").optional(),
  brand: z.string().max(100, "Thương hiệu tối đa 100 ký tự").optional(),
  weight: z.number().positive("Trọng lượng phải lớn hơn 0").optional(),
  dimensions: z.object({
    length: z.number().positive("Chiều dài phải lớn hơn 0").optional(),
    width: z.number().positive("Chiều rộng phải lớn hơn 0").optional(),
    height: z.number().positive("Chiều cao phải lớn hơn 0").optional(),
    unit: z.enum(["cm", "m", "mm"]).optional().default("cm"),
  }).optional(),
  images: z.array(z.string().url("URL hình ảnh không hợp lệ")).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  isActive: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
  metaTitle: z.string().max(255, "Meta title tối đa 255 ký tự").optional(),
  metaDescription: z.string().max(500, "Meta description tối đa 500 ký tự").optional(),
});

type CreateProductData = z.infer<typeof createProductSchema>;

// Return type
type CreateProductResult =
  | {
      success: true;
      message: string;
      product: Product;
    }
  | { success: false; error: string };

export async function createProduct(data: CreateProductData): Promise<CreateProductResult> {
  try {
    // 1. Validate input
    const validatedData = createProductSchema.parse(data);

    // 2. Create Supabase client
    const supabase = createClient();

    // 3. Check admin authorization
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "Bạn cần đăng nhập để tạo sản phẩm",
      };
    }

    // Check if user is admin
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || !userRole || userRole.role !== "admin") {
      return {
        success: false,
        error: "Bạn không có quyền tạo sản phẩm",
      };
    }

    // 4. Check if slug already exists
    const { data: existingProduct, error: slugError } = await supabase
      .from("products")
      .select("id")
      .eq("slug", validatedData.slug)
      .single();

    if (slugError && slugError.code !== "PGRST116") {
      return {
        success: false,
        error: slugError.message || "Không thể kiểm tra slug",
      };
    }

    if (existingProduct) {
      return {
        success: false,
        error: "Slug này đã được sử dụng",
      };
    }

    // 5. Check if SKU already exists (if provided)
    if (validatedData.sku) {
      const { data: existingSku, error: skuError } = await supabase
        .from("products")
        .select("id")
        .eq("sku", validatedData.sku)
        .single();

      if (skuError && skuError.code !== "PGRST116") {
        return {
          success: false,
          error: skuError.message || "Không thể kiểm tra SKU",
        };
      }

      if (existingSku) {
        return {
          success: false,
          error: "SKU này đã được sử dụng",
        };
      }
    }

    // 6. Validate category exists (if provided)
    if (validatedData.categoryId) {
      const { data: category, error: categoryError } = await supabase
        .from("categories")
        .select("id, is_active")
        .eq("id", validatedData.categoryId)
        .single();

      if (categoryError) {
        if (categoryError.code === "PGRST116") {
          return {
            success: false,
            error: "Không tìm thấy danh mục",
          };
        }
        return {
          success: false,
          error: categoryError.message || "Không thể kiểm tra danh mục",
        };
      }

      if (!category.is_active) {
        return {
          success: false,
          error: "Không thể tạo sản phẩm trong danh mục đã bị vô hiệu hóa",
        };
      }
    }

    // 7. Validate price logic
    if (validatedData.comparePrice && validatedData.comparePrice <= validatedData.price) {
      return {
        success: false,
        error: "Giá so sánh phải lớn hơn giá bán",
      };
    }

    if (validatedData.costPrice && validatedData.costPrice >= validatedData.price) {
      return {
        success: false,
        error: "Giá gốc phải nhỏ hơn giá bán",
      };
    }

    // 8. Prepare product data
    const now = new Date().toISOString();
    const productData = {
      name: validatedData.name,
      slug: validatedData.slug,
      description: validatedData.description || null,
      short_description: validatedData.shortDescription || null,
      sku: validatedData.sku || null,
      price: validatedData.price,
      compare_price: validatedData.comparePrice || null,
      cost_price: validatedData.costPrice || null,
      stock_quantity: validatedData.stockQuantity,
      low_stock_threshold: validatedData.lowStockThreshold,
      category_id: validatedData.categoryId || null,
      brand: validatedData.brand || null,
      weight: validatedData.weight || null,
      dimensions: validatedData.dimensions || null,
      images: validatedData.images,
      tags: validatedData.tags,
      is_active: validatedData.isActive,
      is_featured: validatedData.isFeatured,
      meta_title: validatedData.metaTitle || null,
      meta_description: validatedData.metaDescription || null,
      created_at: now,
      updated_at: now,
    };

    // 9. Create product
    const { data: newProduct, error: insertError } = await supabase
      .from("products")
      .insert(productData)
      .select()
      .single();

    if (insertError) {
      return {
        success: false,
        error: insertError.message || "Không thể tạo sản phẩm",
      };
    }

    if (!newProduct) {
      return {
        success: false,
        error: "Không thể tạo sản phẩm",
      };
    }

    return {
      success: true,
      message: `Đã tạo sản phẩm "${validatedData.name}" thành công`,
      product: newProduct,
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
      error: "Đã xảy ra lỗi không mong muốn khi tạo sản phẩm",
    };
  }
} 