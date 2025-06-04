"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schema cho lấy banners
const getBannersSchema = z.object({
  isActive: z.boolean().optional(),
  position: z.enum(["hero", "sidebar", "footer", "popup", "category"]).optional(),
}).optional();

type GetBannersFilters = z.infer<typeof getBannersSchema>;

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

type GetBannersResult =
  | { success: true; banners: Banner[]; total: number }
  | { success: false; error: string };

export async function getBanners(
  filters?: GetBannersFilters
): Promise<GetBannersResult> {
  try {
    // Validate input
    const validatedFilters = getBannersSchema.parse(filters);

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

    // Kiểm tra authorization - chỉ admin mới có thể xem tất cả banners
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || userRole?.role !== "admin") {
      return {
        success: false,
        error: "Chỉ admin mới có thể xem danh sách banner",
      };
    }

    // Mock implementation - tạo dữ liệu demo banners
    const mockBanners: Banner[] = [
      {
        id: 1,
        title: "Banner Khuyến Mãi Tết 2024",
        description: "Giảm giá đến 50% cho tất cả sản phẩm trong dịp Tết Nguyên Đán",
        image_url: "https://example.com/images/tet-banner.jpg",
        link_url: "https://shop.com/tet-sale",
        position: "hero",
        is_active: true,
        start_date: "2024-01-15T00:00:00Z",
        end_date: "2024-02-15T23:59:59Z",
        target_type: "_self",
        priority: 100,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
      {
        id: 2,
        title: "Banner Sản Phẩm Mới",
        description: "Khám phá bộ sưu tập thời trang mùa xuân 2024",
        image_url: "https://example.com/images/spring-collection.jpg",
        link_url: "https://shop.com/spring-collection",
        position: "sidebar",
        is_active: true,
        start_date: null,
        end_date: null,
        target_type: "_self",
        priority: 80,
        created_at: "2024-01-05T00:00:00Z",
        updated_at: "2024-01-05T00:00:00Z",
      },
      {
        id: 3,
        title: "Banner Footer - Liên Hệ",
        description: "Thông tin liên hệ và hỗ trợ khách hàng",
        image_url: "https://example.com/images/contact-banner.jpg",
        link_url: "https://shop.com/contact",
        position: "footer",
        is_active: false,
        start_date: null,
        end_date: null,
        target_type: "_blank",
        priority: 50,
        created_at: "2024-01-10T00:00:00Z",
        updated_at: "2024-01-10T00:00:00Z",
      },
      {
        id: 4,
        title: "Popup Đăng Ký Newsletter",
        description: "Đăng ký nhận thông tin khuyến mãi mới nhất",
        image_url: "https://example.com/images/newsletter-popup.jpg",
        link_url: "https://shop.com/newsletter",
        position: "popup",
        is_active: true,
        start_date: null,
        end_date: null,
        target_type: "_self",
        priority: 90,
        created_at: "2024-01-12T00:00:00Z",
        updated_at: "2024-01-12T00:00:00Z",
      },
    ];

    // Apply filters
    let filteredBanners = mockBanners;

    if (validatedFilters) {
      if (validatedFilters.isActive !== undefined) {
        filteredBanners = filteredBanners.filter(
          banner => banner.is_active === validatedFilters.isActive
        );
      }

      if (validatedFilters.position) {
        filteredBanners = filteredBanners.filter(
          banner => banner.position === validatedFilters.position
        );
      }
    }

    // Sort by priority (cao nhất trước) và created_at
    filteredBanners.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority; // Priority cao hơn trước
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    // TODO: Thay thế bằng database operation khi bảng banners được tạo
    /*
    // Build query
    let query = supabase
      .from("banners")
      .select("*");

    // Apply filters
    if (validatedFilters) {
      if (validatedFilters.isActive !== undefined) {
        query = query.eq("is_active", validatedFilters.isActive);
      }
      if (validatedFilters.position) {
        query = query.eq("position", validatedFilters.position);
      }
    }

    // Execute query với sorting
    const { data: banners, error: fetchError } = await query
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });

    if (fetchError) {
      return {
        success: false,
        error: "Lỗi khi lấy danh sách banner",
      };
    }
    */

    // Log admin action
    console.log(`Admin ${user.id} fetched banners`, {
      filters: validatedFilters,
      count: filteredBanners.length,
    });

    return {
      success: true,
      banners: filteredBanners,
      total: filteredBanners.length,
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
      error: "Đã xảy ra lỗi không mong muốn khi lấy danh sách banner",
    };
  }
} 