"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schema cho upload banner image
const uploadBannerImageSchema = z.object({
  bannerId: z.number().int().positive("ID banner không hợp lệ"),
  file: z.instanceof(File),
});

type UploadBannerImageResult =
  | { success: true; message: string; imageUrl: string }
  | { success: false; error: string };

export async function uploadBannerImage(
  bannerId: number,
  file: File
): Promise<UploadBannerImageResult> {
  try {
    // Validate input
    const validatedData = uploadBannerImageSchema.parse({ bannerId, file });

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

    // Kiểm tra authorization - chỉ admin mới có thể upload banner image
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || userRole?.role !== "admin") {
      return {
        success: false,
        error: "Chỉ admin mới có thể upload hình ảnh banner",
      };
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(validatedData.file.type)) {
      return {
        success: false,
        error: "Chỉ hỗ trợ file hình ảnh (JPEG, PNG, WebP, GIF)",
      };
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (validatedData.file.size > maxSize) {
      return {
        success: false,
        error: "Kích thước file không được vượt quá 5MB",
      };
    }

    // Generate unique filename
    const fileExtension = validatedData.file.name.split('.').pop() || 'jpg';
    const uniqueFileName = `banner-${validatedData.bannerId}-${Date.now()}.${fileExtension}`;
    const filePath = `banners/${uniqueFileName}`;

    // TODO: Kiểm tra banner có tồn tại không
    /*
    const { data: existingBanner, error: checkError } = await supabase
      .from("banners")
      .select("id, title, image_url")
      .eq("id", validatedData.bannerId)
      .single();

    if (checkError || !existingBanner) {
      return {
        success: false,
        error: "Banner không tồn tại",
      };
    }
    */

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("banner-images") // Bucket name - cần tạo bucket này
      .upload(filePath, validatedData.file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return {
        success: false,
        error: "Lỗi khi upload hình ảnh. Vui lòng thử lại.",
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("banner-images")
      .getPublicUrl(filePath);

    const imageUrl = urlData.publicUrl;

    // TODO: Cập nhật image_url trong bảng banners
    /*
    // Xóa file cũ nếu có
    if (existingBanner.image_url) {
      try {
        // Extract file path from old URL
        const oldFilePath = extractFilePathFromUrl(existingBanner.image_url);
        if (oldFilePath) {
          await supabase.storage
            .from("banner-images")
            .remove([oldFilePath]);
        }
      } catch (error) {
        console.warn("Không thể xóa file cũ:", error);
      }
    }

    // Cập nhật banner với image URL mới
    const { error: updateError } = await supabase
      .from("banners")
      .update({
        image_url: imageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", validatedData.bannerId);

    if (updateError) {
      // Nếu cập nhật database thất bại, xóa file đã upload
      await supabase.storage
        .from("banner-images")
        .remove([filePath]);

      return {
        success: false,
        error: "Lỗi khi cập nhật thông tin banner",
      };
    }
    */

    // Log admin action
    console.log(`Admin ${user.id} uploaded image for banner ${validatedData.bannerId}`, {
      fileName: validatedData.file.name,
      fileSize: validatedData.file.size,
      filePath,
      imageUrl,
    });

    return {
      success: true,
      message: `Đã upload thành công hình ảnh cho banner ID ${validatedData.bannerId}`,
      imageUrl,
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
      error: "Đã xảy ra lỗi không mong muốn khi upload hình ảnh banner",
    };
  }
} 