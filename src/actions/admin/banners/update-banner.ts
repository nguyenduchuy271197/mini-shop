"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schema cho cập nhật banner
const updateBannerSchema = z.object({
  bannerId: z.number().int().positive("ID banner không hợp lệ"),
  data: z.object({
    title: z.string().min(1, "Tiêu đề banner là bắt buộc").max(200, "Tiêu đề không được quá 200 ký tự").optional(),
    description: z.string().optional(),
    image_url: z.string().url("URL hình ảnh không hợp lệ").optional(),
    link_url: z.string().url("URL liên kết không hợp lệ").optional(),
    position: z.enum(["hero", "sidebar", "footer", "popup", "category"], {
      errorMap: () => ({ message: "Vị trí banner không hợp lệ" }),
    }).optional(),
    is_active: z.boolean().optional(),
    start_date: z.string().datetime("Ngày bắt đầu không hợp lệ").optional(),
    end_date: z.string().datetime("Ngày kết thúc không hợp lệ").optional(),
    target_type: z.enum(["_blank", "_self"], {
      errorMap: () => ({ message: "Kiểu target không hợp lệ" }),
    }).optional(),
    priority: z.number().int().min(0).max(100).optional(),
  }),
});

type BannerUpdate = z.infer<typeof updateBannerSchema>["data"];

type Banner = {
  id: number;
  title: string;
  description: string | null;
  image_url: string;
  link_url: string | null;
  position: "hero" | "sidebar" | "footer" | "popup" | "category";
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  target_type: "_blank" | "_self";
  priority: number;
  created_at: string;
  updated_at: string;
};

type UpdateBannerResult =
  | { success: true; message: string; banner: Banner }
  | { success: false; error: string };

export async function updateBanner(
  bannerId: number,
  bannerData: BannerUpdate
): Promise<UpdateBannerResult> {
  try {
    // Validate input
    const validatedData = updateBannerSchema.parse({ bannerId, data: bannerData });

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

    // Kiểm tra authorization - chỉ admin mới có thể cập nhật banner
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || userRole?.role !== "admin") {
      return {
        success: false,
        error: "Chỉ admin mới có thể cập nhật banner",
      };
    }

    // Validate ngày kết thúc phải sau ngày bắt đầu (nếu cả hai được cung cấp)
    if (validatedData.data.start_date && validatedData.data.end_date) {
      const startDate = new Date(validatedData.data.start_date);
      const endDate = new Date(validatedData.data.end_date);
      
      if (endDate <= startDate) {
        return {
          success: false,
          error: "Ngày kết thúc phải sau ngày bắt đầu",
        };
      }
    }

    // Mock implementation - lấy banner hiện tại và cập nhật
    // Trong thực tế sẽ query từ bảng banners
    const mockExistingBanner: Banner = {
      id: validatedData.bannerId,
      title: "Banner hiện tại",
      description: "Mô tả banner hiện tại",
      image_url: "https://example.com/current-banner.jpg",
      link_url: "https://example.com",
      position: "hero",
      is_active: true,
      start_date: null,
      end_date: null,
      target_type: "_self",
      priority: 10,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };

    // Cập nhật banner với dữ liệu mới
    const updatedBanner: Banner = {
      ...mockExistingBanner,
      ...validatedData.data,
      updated_at: new Date().toISOString(),
    };

    // TODO: Thay thế bằng database operation khi bảng banners được tạo
    /*
    // Kiểm tra banner có tồn tại không
    const { data: existingBanner, error: checkError } = await supabase
      .from("banners")
      .select("*")
      .eq("id", validatedData.bannerId)
      .single();

    if (checkError || !existingBanner) {
      return {
        success: false,
        error: "Banner không tồn tại",
      };
    }

    // Cập nhật banner
    const { data: updatedBanner, error: updateError } = await supabase
      .from("banners")
      .update({
        ...validatedData.data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", validatedData.bannerId)
      .select()
      .single();

    if (updateError) {
      return {
        success: false,
        error: "Lỗi khi cập nhật banner",
      };
    }
    */

    // Log admin action
    console.log(`Admin ${user.id} updated banner ${validatedData.bannerId}`, validatedData.data);

    const changedFields = Object.keys(validatedData.data).join(", ");

    return {
      success: true,
      message: `Đã cập nhật thành công banner "${updatedBanner.title}". Các trường đã thay đổi: ${changedFields}`,
      banner: updatedBanner,
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
      error: "Đã xảy ra lỗi không mong muốn khi cập nhật banner",
    };
  }
} 