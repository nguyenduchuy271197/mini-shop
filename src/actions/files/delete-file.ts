"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schema cho delete file
const deleteFileSchema = z.object({
  filePath: z.string().min(1, "Đường dẫn file là bắt buộc"),
  bucket: z.string().min(1, "Bucket name là bắt buộc"),
});

type DeleteFileResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function deleteFile(
  filePath: string,
  bucket: string
): Promise<DeleteFileResult> {
  try {
    // Validate input
    const validatedData = deleteFileSchema.parse({ filePath, bucket });

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
        search: validatedData.filePath,
      });

    if (checkError) {
      return {
        success: false,
        error: "Lỗi khi kiểm tra file tồn tại",
      };
    }

    // Tìm file trong danh sách (vì search có thể trả về nhiều kết quả)
    const fileExists = fileData?.some(file => 
      file.name === validatedData.filePath.split('/').pop()
    );

    if (!fileExists) {
      return {
        success: false,
        error: "File không tồn tại hoặc đã bị xóa",
      };
    }

    // Xóa file từ Storage
    const { error: deleteError } = await supabase.storage
      .from(validatedData.bucket)
      .remove([validatedData.filePath]);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return {
        success: false,
        error: "Lỗi khi xóa file. Vui lòng thử lại.",
      };
    }

    // Log delete action
    console.log(`User ${user.id} deleted file ${validatedData.bucket}/${validatedData.filePath}`);

    return {
      success: true,
      message: `Đã xóa thành công file "${validatedData.filePath}"`,
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
      error: "Đã xảy ra lỗi không mong muốn khi xóa file",
    };
  }
} 