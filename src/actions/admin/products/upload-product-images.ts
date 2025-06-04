"use server";

import { createClient } from "@/lib/supabase/server";
import { Product } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const uploadProductImagesSchema = z.object({
  productId: z.number().positive("ID sản phẩm không hợp lệ"),
  imageUrls: z.array(z.string().url("URL hình ảnh không hợp lệ")).min(1, "Phải có ít nhất một hình ảnh").max(10, "Tối đa 10 hình ảnh"),
  replaceAll: z.boolean().optional().default(false),
});

type UploadProductImagesData = z.infer<typeof uploadProductImagesSchema>;

// Return type
type UploadProductImagesResult =
  | {
      success: true;
      message: string;
      product: Product;
      totalImages: number;
    }
  | { success: false; error: string };

export async function uploadProductImages(data: UploadProductImagesData): Promise<UploadProductImagesResult> {
  try {
    // 1. Validate input
    const { productId, imageUrls, replaceAll } = uploadProductImagesSchema.parse(data);

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
        error: "Bạn cần đăng nhập để tải lên hình ảnh sản phẩm",
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
        error: "Bạn không có quyền tải lên hình ảnh sản phẩm",
      };
    }

    // 4. Get existing product
    const { data: existingProduct, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return {
          success: false,
          error: "Không tìm thấy sản phẩm",
        };
      }
      return {
        success: false,
        error: fetchError.message || "Không thể lấy thông tin sản phẩm",
      };
    }

    if (!existingProduct) {
      return {
        success: false,
        error: "Không tìm thấy sản phẩm",
      };
    }

    // 5. Validate image URLs (basic validation)
    const validImageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const invalidUrls = imageUrls.filter(url => {
      try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname.toLowerCase();
        return !validImageExtensions.some(ext => pathname.endsWith(ext));
      } catch {
        return true;
      }
    });

    if (invalidUrls.length > 0) {
      return {
        success: false,
        error: `URL hình ảnh không hợp lệ hoặc không phải định dạng ảnh: ${invalidUrls.join(", ")}`,
      };
    }

    // 6. Prepare new images array
    let newImages: string[];
    
    if (replaceAll) {
      // Replace all existing images
      newImages = imageUrls;
    } else {
      // Add to existing images
      const existingImages = existingProduct.images || [];
      newImages = [...existingImages, ...imageUrls];
      
      // Remove duplicates
      newImages = Array.from(new Set(newImages));
      
      // Check total image limit
      if (newImages.length > 10) {
        return {
          success: false,
          error: `Tổng số hình ảnh (${newImages.length}) vượt quá giới hạn 10 ảnh. Hiện có ${existingImages.length} ảnh, đang thêm ${imageUrls.length} ảnh.`,
        };
      }
    }

    // 7. Update product with new images
    const { data: updatedProduct, error: updateError } = await supabase
      .from("products")
      .update({
        images: newImages,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId)
      .select()
      .single();

    if (updateError) {
      return {
        success: false,
        error: updateError.message || "Không thể cập nhật hình ảnh sản phẩm",
      };
    }

    if (!updatedProduct) {
      return {
        success: false,
        error: "Không thể cập nhật hình ảnh sản phẩm",
      };
    }

    // 8. Create success message
    const actionText = replaceAll ? "Đã thay thế tất cả" : "Đã thêm";
    const imageCountText = imageUrls.length === 1 ? "hình ảnh" : `${imageUrls.length} hình ảnh`;

    return {
      success: true,
      message: `${actionText} ${imageCountText} cho sản phẩm "${existingProduct.name}". Tổng cộng: ${newImages.length} hình ảnh.`,
      product: updatedProduct,
      totalImages: newImages.length,
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
      error: "Đã xảy ra lỗi không mong muốn khi tải lên hình ảnh sản phẩm",
    };
  }
} 