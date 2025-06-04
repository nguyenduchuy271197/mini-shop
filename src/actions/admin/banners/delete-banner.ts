"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schema cho xóa banner
const deleteBannerSchema = z.object({
  bannerId: z.number().int().positive("ID banner không hợp lệ"),
});

type DeleteBannerResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function deleteBanner(
  bannerId: number
): Promise<DeleteBannerResult> {
  try {
    // Validate input
    const validatedData = deleteBannerSchema.parse({ bannerId });

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

    // Kiểm tra authorization - chỉ admin mới có thể xóa banner
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || userRole?.role !== "admin") {
      return {
        success: false,
        error: "Chỉ admin mới có thể xóa banner",
      };
    }

    // Mock implementation - giả lập việc lấy thông tin banner trước khi xóa
    // Trong thực tế sẽ query từ bảng banners
    const mockBannerInfo = {
      id: validatedData.bannerId,
      title: "Banner Demo",
      position: "hero",
      is_active: true,
    };

    // TODO: Thay thế bằng database operation khi bảng banners được tạo
    /*
    // Kiểm tra banner có tồn tại không
    const { data: existingBanner, error: checkError } = await supabase
      .from("banners")
      .select("id, title, position, is_active, image_url")
      .eq("id", validatedData.bannerId)
      .single();

    if (checkError || !existingBanner) {
      return {
        success: false,
        error: "Banner không tồn tại",
      };
    }

    // Xóa banner
    const { error: deleteError } = await supabase
      .from("banners")
      .delete()
      .eq("id", validatedData.bannerId);

    if (deleteError) {
      return {
        success: false,
        error: "Lỗi khi xóa banner",
      };
    }

    // TODO: Xóa file hình ảnh từ storage nếu cần
    if (existingBanner.image_url) {
      // Extract file path from URL và xóa từ storage
      // await deleteFileFromStorage(existingBanner.image_url);
    }
    */

    // Log admin action
    console.log(`Admin ${user.id} deleted banner ${validatedData.bannerId}`, {
      title: mockBannerInfo.title,
      position: mockBannerInfo.position,
    });

    return {
      success: true,
      message: `Đã xóa thành công banner "${mockBannerInfo.title}" tại vị trí ${mockBannerInfo.position}`,
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
      error: "Đã xảy ra lỗi không mong muốn khi xóa banner",
    };
  }
} 