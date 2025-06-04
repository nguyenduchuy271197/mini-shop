"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schema cho get signed upload URL
const getSignedUploadUrlSchema = z.object({
  fileName: z.string().min(1, "Tên file là bắt buộc"),
  bucket: z.string().min(1, "Bucket name là bắt buộc"),
  fileType: z.string().optional(),
  maxSizeBytes: z.number().int().positive().optional(),
});

type GetSignedUploadUrlResult =
  | { 
      success: true; 
      uploadUrl: string; 
      filePath: string;
      publicUrl: string;
      token: string;
    }
  | { success: false; error: string };

export async function getSignedUploadUrl(
  fileName: string,
  bucket: string,
  fileType?: string,
  maxSizeBytes?: number
): Promise<GetSignedUploadUrlResult> {
  try {
    // Validate input
    const validatedData = getSignedUploadUrlSchema.parse({ 
      fileName, 
      bucket,
      fileType,
      maxSizeBytes 
    });

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

    // Validate file type nếu được cung cấp
    if (validatedData.fileType) {
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

      if (!allowedTypes.includes(validatedData.fileType)) {
        return {
          success: false,
          error: "Định dạng file không được hỗ trợ",
        };
      }
    }

    // Validate file size
    const maxSize = validatedData.maxSizeBytes || 10 * 1024 * 1024; // Default 10MB
    if (maxSize > 50 * 1024 * 1024) { // Hard limit 50MB
      return {
        success: false,
        error: "Kích thước file tối đa là 50MB",
      };
    }

    // Tạo unique filename để tránh conflict
    const sanitizedName = validatedData.fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Thay thế ký tự đặc biệt
      .toLowerCase();
    
    const uniqueFilePath = `uploads/${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}-${sanitizedName}`;

    // Tạo signed URL cho upload (valid trong 1 giờ)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(validatedData.bucket)
      .createSignedUploadUrl(uniqueFilePath, {
        upsert: false,
      });

    if (signedUrlError || !signedUrlData) {
      console.error("Signed upload URL error:", signedUrlError);
      return {
        success: false,
        error: "Lỗi khi tạo URL upload. Vui lòng thử lại.",
      };
    }

    // Get public URL để client có thể sử dụng sau khi upload
    const { data: publicUrlData } = supabase.storage
      .from(validatedData.bucket)
      .getPublicUrl(uniqueFilePath);

    const publicUrl = publicUrlData.publicUrl;

    // Log signed URL creation
    console.log(`User ${user.id} created signed upload URL for ${validatedData.bucket}/${uniqueFilePath}`, {
      fileName: validatedData.fileName,
      fileType: validatedData.fileType,
      maxSizeBytes: maxSize,
    });

    return {
      success: true,
      uploadUrl: signedUrlData.signedUrl,
      filePath: uniqueFilePath,
      publicUrl,
      token: signedUrlData.token,
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
      error: "Đã xảy ra lỗi không mong muốn khi tạo URL upload",
    };
  }
} 