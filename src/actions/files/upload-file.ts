"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schema cho upload file
const uploadFileSchema = z.object({
  file: z.instanceof(File),
  bucket: z.string().min(1, "Bucket name là bắt buộc"),
  path: z.string().min(1, "Đường dẫn file là bắt buộc"),
});

type UploadFileResult =
  | { success: true; message: string; filePath: string; publicUrl: string }
  | { success: false; error: string };

export async function uploadFile(
  file: File,
  bucket: string,
  path: string
): Promise<UploadFileResult> {
  try {
    // Validate input
    const validatedData = uploadFileSchema.parse({ file, bucket, path });

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

    // Validate file size (tối đa 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (validatedData.file.size > maxSize) {
      return {
        success: false,
        error: "Kích thước file không được vượt quá 10MB",
      };
    }

    // Validate file type (chỉ cho phép một số định dạng an toàn)
    const allowedTypes = [
      "image/jpeg",
      "image/png", 
      "image/gif",
      "image/webp",
      "application/pdf",
      "text/plain",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
      "text/csv",
    ];

    if (!allowedTypes.includes(validatedData.file.type)) {
      return {
        success: false,
        error: "Định dạng file không được hỗ trợ",
      };
    }

    // Tạo unique filename để tránh conflict
    const fileExtension = validatedData.file.name.split('.').pop() || '';
    const uniquePath = `${validatedData.path}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(validatedData.bucket)
      .upload(uniquePath, validatedData.file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return {
        success: false,
        error: "Lỗi khi upload file. Vui lòng thử lại.",
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(validatedData.bucket)
      .getPublicUrl(uniquePath);

    const publicUrl = urlData.publicUrl;

    // Log upload action
    console.log(`User ${user.id} uploaded file to ${validatedData.bucket}/${uniquePath}`, {
      originalFileName: validatedData.file.name,
      fileSize: validatedData.file.size,
      fileType: validatedData.file.type,
      uploadPath: uploadData.path,
    });

    return {
      success: true,
      message: `Đã upload thành công file "${validatedData.file.name}"`,
      filePath: uploadData.path,
      publicUrl,
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
      error: "Đã xảy ra lỗi không mong muốn khi upload file",
    };
  }
} 