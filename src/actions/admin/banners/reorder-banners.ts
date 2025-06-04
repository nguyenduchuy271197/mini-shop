"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schema cho reorder banners
const reorderBannersSchema = z.object({
  bannerOrders: z.array(
    z.object({
      id: z.number().int().positive("ID banner không hợp lệ"),
      priority: z.number().int().min(0).max(100, "Priority phải từ 0 đến 100"),
    })
  ).min(1, "Phải có ít nhất một banner để sắp xếp"),
});

type BannerOrder = {
  id: number;
  priority: number;
};

type ReorderBannersResult =
  | { success: true; message: string; updatedBanners: BannerOrder[] }
  | { success: false; error: string };

export async function reorderBanners(
  bannerOrders: BannerOrder[]
): Promise<ReorderBannersResult> {
  try {
    // Validate input
    const validatedData = reorderBannersSchema.parse({ bannerOrders });

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

    // Kiểm tra authorization - chỉ admin mới có thể sắp xếp lại banner
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || userRole?.role !== "admin") {
      return {
        success: false,
        error: "Chỉ admin mới có thể sắp xếp lại banner",
      };
    }

    // Kiểm tra duplicate IDs
    const bannerIds = validatedData.bannerOrders.map(order => order.id);
    const uniqueIds = new Set(bannerIds);
    
    if (uniqueIds.size !== bannerIds.length) {
      return {
        success: false,
        error: "Không được trùng lặp ID banner",
      };
    }

    // Kiểm tra duplicate priorities trong cùng position (nếu có)
    const priorities = validatedData.bannerOrders.map(order => order.priority);
    const uniquePriorities = new Set(priorities);
    
    if (uniquePriorities.size !== priorities.length) {
      return {
        success: false,
        error: "Không được trùng lặp priority cho các banner",
      };
    }

    // Mock implementation - giả lập việc cập nhật priority
    const updatedBanners: BannerOrder[] = [];

    for (const order of validatedData.bannerOrders) {
      // TODO: Thay thế bằng database operation khi bảng banners được tạo
      /*
      // Kiểm tra banner có tồn tại không
      const { data: existingBanner, error: checkError } = await supabase
        .from("banners")
        .select("id, title, position")
        .eq("id", order.id)
        .single();

      if (checkError || !existingBanner) {
        return {
          success: false,
          error: `Banner với ID ${order.id} không tồn tại`,
        };
      }

      // Cập nhật priority
      const { error: updateError } = await supabase
        .from("banners")
        .update({
          priority: order.priority,
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      if (updateError) {
        return {
          success: false,
          error: `Lỗi khi cập nhật priority cho banner ID ${order.id}`,
        };
      }
      */

      // Mock successful update
      updatedBanners.push({
        id: order.id,
        priority: order.priority,
      });

      console.log(`Admin ${user.id} updated priority for banner ${order.id} to ${order.priority}`);
    }

    // Log admin action
    console.log(`Admin ${user.id} reordered ${validatedData.bannerOrders.length} banners`, {
      orders: validatedData.bannerOrders,
    });

    return {
      success: true,
      message: `Đã cập nhật thành công thứ tự hiển thị cho ${validatedData.bannerOrders.length} banner`,
      updatedBanners,
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
      error: "Đã xảy ra lỗi không mong muốn khi sắp xếp lại banner",
    };
  }
} 