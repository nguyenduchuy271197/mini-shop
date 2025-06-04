"use server";

import { createClient } from "@/lib/supabase/server";
import { Category } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const uploadCategoryImageSchema = z.object({
  categoryId: z.number().positive("ID danh mục không hợp lệ"),
  imageUrl: z.string().url("URL hình ảnh không hợp lệ"),
  replaceExisting: z.boolean().optional().default(true),
});

type UploadCategoryImageData = z.infer<typeof uploadCategoryImageSchema>;

// Return type
type UploadCategoryImageResult =
  | {
      success: true;
      message: string;
      category: Category;
      imageUrl: string;
    }
  | { success: false; error: string };

export async function uploadCategoryImage(data: UploadCategoryImageData): Promise<UploadCategoryImageResult> {
  try {
    // 1. Validate input
    const { categoryId, imageUrl, replaceExisting } = uploadCategoryImageSchema.parse(data);

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
        error: "Bạn cần đăng nhập để tải lên hình ảnh danh mục",
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
        error: "Bạn không có quyền tải lên hình ảnh danh mục",
      };
    }

    // 4. Get existing category
    const { data: existingCategory, error: fetchError } = await supabase
      .from("categories")
      .select("*")
      .eq("id", categoryId)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return {
          success: false,
          error: "Không tìm thấy danh mục",
        };
      }
      return {
        success: false,
        error: fetchError.message || "Không thể lấy thông tin danh mục",
      };
    }

    if (!existingCategory) {
      return {
        success: false,
        error: "Không tìm thấy danh mục",
      };
    }

    // 5. Check if category already has an image (if not replacing)
    if (!replaceExisting && existingCategory.image_url) {
      return {
        success: false,
        error: "Danh mục đã có hình ảnh. Hãy sử dụng tùy chọn thay thế nếu muốn cập nhật.",
      };
    }

    // 6. Validate image URL format (basic validation)
    const validImageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
    let isValidImageUrl = false;
    
    try {
      const urlObj = new URL(imageUrl);
      const pathname = urlObj.pathname.toLowerCase();
      isValidImageUrl = validImageExtensions.some(ext => pathname.endsWith(ext));
    } catch {
      isValidImageUrl = false;
    }

    if (!isValidImageUrl) {
      return {
        success: false,
        error: "URL hình ảnh không hợp lệ hoặc không phải định dạng ảnh được hỗ trợ (jpg, jpeg, png, webp, gif, svg)",
      };
    }

    // 7. Check if the URL is accessible (optional validation)
    try {
      const response = await fetch(imageUrl, { method: 'HEAD' });
      if (!response.ok) {
        return {
          success: false,
          error: "Không thể truy cập URL hình ảnh. Vui lòng kiểm tra lại URL.",
        };
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        return {
          success: false,
          error: "URL không trỏ đến một hình ảnh hợp lệ",
        };
      }
    } catch (error) {
      console.error("Error validating image URL:", error);
      return {
        success: false,
        error: "Không thể xác thực URL hình ảnh. Vui lòng kiểm tra lại URL.",
      };
    }

    // 8. Update category with new image URL
    const { data: updatedCategory, error: updateError } = await supabase
      .from("categories")
      .update({
        image_url: imageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", categoryId)
      .select()
      .single();

    if (updateError) {
      return {
        success: false,
        error: updateError.message || "Không thể cập nhật hình ảnh danh mục",
      };
    }

    if (!updatedCategory) {
      return {
        success: false,
        error: "Không thể cập nhật hình ảnh danh mục",
      };
    }

    // 9. Create success message
    const actionText = existingCategory.image_url ? "Đã cập nhật" : "Đã thêm";

    return {
      success: true,
      message: `${actionText} hình ảnh cho danh mục "${existingCategory.name}" thành công`,
      category: updatedCategory,
      imageUrl: imageUrl,
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
      error: "Đã xảy ra lỗi không mong muốn khi tải lên hình ảnh danh mục",
    };
  }
} 