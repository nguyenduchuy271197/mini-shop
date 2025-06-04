"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schema cho get file URL
const getFileUrlSchema = z.object({
  filePath: z.string().min(1, "Đường dẫn file là bắt buộc"),
  bucket: z.string().min(1, "Bucket name là bắt buộc"),
});

type GetFileUrlResult =
  | { success: true; publicUrl: string; signedUrl?: string }
  | { success: false; error: string };

export async function getFileUrl(
  filePath: string,
  bucket: string
): Promise<GetFileUrlResult> {
  try {
    // Validate input
    const validatedData = getFileUrlSchema.parse({ filePath, bucket });

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

    // Kiểm tra file có tồn tại không
    const { data: fileData, error: checkError } = await supabase.storage
      .from(validatedData.bucket)
      .list('', {
        search: validatedData.filePath.split('/').pop() || '',
      });

    if (checkError) {
      return {
        success: false,
        error: "Lỗi khi kiểm tra file tồn tại",
      };
    }

    // Tìm file trong danh sách
    const fileExists = fileData?.some(file => 
      file.name === validatedData.filePath.split('/').pop()
    );

    if (!fileExists) {
      return {
        success: false,
        error: "File không tồn tại",
      };
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(validatedData.bucket)
      .getPublicUrl(validatedData.filePath);

    const publicUrl = publicUrlData.publicUrl;

    // Tạo signed URL cho files private (valid trong 1 giờ)
    let signedUrl: string | undefined;
    
    try {
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from(validatedData.bucket)
        .createSignedUrl(validatedData.filePath, 3600); // 1 hour

      if (!signedUrlError && signedUrlData) {
        signedUrl = signedUrlData.signedUrl;
      }
    } catch (error) {
      // Không throw error nếu signed URL thất bại, vì có thể bucket là public
      console.warn(`Could not create signed URL for ${validatedData.filePath}:`, error);
    }

    // Log access
    console.log(`User ${user.id} accessed file URL ${validatedData.bucket}/${validatedData.filePath}`);

    return {
      success: true,
      publicUrl,
      signedUrl,
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
      error: "Đã xảy ra lỗi không mong muốn khi lấy URL file",
    };
  }
} 