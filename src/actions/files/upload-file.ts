"use server";

import { createClient } from "@/lib/supabase/server";

type UploadFileResult =
  | { success: true; message: string; filePath: string; publicUrl: string }
  | { success: false; error: string };

export async function uploadFile(formData: FormData): Promise<UploadFileResult> {
  try {
    // Extract data from FormData
    const file = formData.get('file') as File;
    const bucket = formData.get('bucket') as string;
    const path = formData.get('path') as string;

    // Validate required fields
    if (!file || !(file instanceof File)) {
      return {
        success: false,
        error: "File là bắt buộc và phải là file hợp lệ",
      };
    }

    if (!bucket) {
      return {
        success: false,
        error: "Bucket name là bắt buộc",
      };
    }

    if (!path) {
      return {
        success: false,
        error: "Đường dẫn file là bắt buộc",
      };
    }

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
    if (file.size > maxSize) {
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

    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: "Định dạng file không được hỗ trợ",
      };
    }

    // Tạo unique filename để tránh conflict
    const fileExtension = file.name.split('.').pop() || '';
    const uniquePath = `${path}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(uniquePath, file, {
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
      .from(bucket)
      .getPublicUrl(uniquePath);

    const publicUrl = urlData.publicUrl;

    // Log upload action
    console.log(`User ${user.id} uploaded file to ${bucket}/${uniquePath}`, {
      originalFileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadPath: uploadData.path,
    });

    return {
      success: true,
      message: `Đã upload thành công file "${file.name}"`,
      filePath: uploadData.path,
      publicUrl,
    };
  } catch (error) {
    console.error("Unexpected error in uploadFile:", error);
    return {
      success: false,
      error: "Đã xảy ra lỗi không mong muốn khi upload file",
    };
  }
} 