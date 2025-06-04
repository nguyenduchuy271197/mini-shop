"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schema cho tạo banner
const createBannerSchema = z.object({
  title: z.string().min(1, "Tiêu đề banner là bắt buộc").max(200, "Tiêu đề không được quá 200 ký tự"),
  description: z.string().optional(),
  image_url: z.string().url("URL hình ảnh không hợp lệ"),
  link_url: z.string().url("URL liên kết không hợp lệ").optional(),
  position: z.enum(["hero", "sidebar", "footer", "popup", "category"], {
    errorMap: () => ({ message: "Vị trí banner không hợp lệ" }),
  }),
  is_active: z.boolean().default(true),
  start_date: z.string().datetime("Ngày bắt đầu không hợp lệ").optional(),
  end_date: z.string().datetime("Ngày kết thúc không hợp lệ").optional(),
  target_type: z.enum(["_blank", "_self"], {
    errorMap: () => ({ message: "Kiểu target không hợp lệ" }),
  }).default("_self"),
  priority: z.number().int().min(0).max(100).default(0),
});

type CreateBannerData = z.infer<typeof createBannerSchema>;

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

type CreateBannerResult =
  | { success: true; message: string; banner: Banner }
  | { success: false; error: string };

export async function createBanner(
  bannerData: CreateBannerData
): Promise<CreateBannerResult> {
  try {
    // Validate input
    const validatedData = createBannerSchema.parse(bannerData);

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

    // Kiểm tra authorization - chỉ admin mới có thể tạo banner
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || userRole?.role !== "admin") {
      return {
        success: false,
        error: "Chỉ admin mới có thể tạo banner",
      };
    }

    // Validate ngày kết thúc phải sau ngày bắt đầu
    if (validatedData.start_date && validatedData.end_date) {
      const startDate = new Date(validatedData.start_date);
      const endDate = new Date(validatedData.end_date);
      
      if (endDate <= startDate) {
        return {
          success: false,
          error: "Ngày kết thúc phải sau ngày bắt đầu",
        };
      }
    }

    // Mock implementation - tạo banner
    // Trong thực tế sẽ insert vào bảng banners
    const now = new Date().toISOString();
    const mockBanner: Banner = {
      id: Math.floor(Math.random() * 10000) + 1000, // Mock ID
      title: validatedData.title,
      description: validatedData.description || null,
      image_url: validatedData.image_url,
      link_url: validatedData.link_url || null,
      position: validatedData.position,
      is_active: validatedData.is_active,
      start_date: validatedData.start_date || null,
      end_date: validatedData.end_date || null,
      target_type: validatedData.target_type,
      priority: validatedData.priority,
      created_at: now,
      updated_at: now,
    };

    // TODO: Thay thế bằng database operation khi bảng banners được tạo
    /*
    const { data: newBanner, error: insertError } = await supabase
      .from("banners")
      .insert({
        title: validatedData.title,
        description: validatedData.description,
        image_url: validatedData.image_url,
        link_url: validatedData.link_url,
        position: validatedData.position,
        is_active: validatedData.is_active,
        start_date: validatedData.start_date,
        end_date: validatedData.end_date,
        target_type: validatedData.target_type,
        priority: validatedData.priority,
      })
      .select()
      .single();

    if (insertError) {
      return {
        success: false,
        error: "Lỗi khi tạo banner",
      };
    }
    */

    // Log admin action
    console.log(`Admin ${user.id} created banner "${validatedData.title}" at position "${validatedData.position}"`);

    return {
      success: true,
      message: `Đã tạo thành công banner "${validatedData.title}" tại vị trí ${validatedData.position}`,
      banner: mockBanner,
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
      error: "Đã xảy ra lỗi không mong muốn khi tạo banner",
    };
  }
} 