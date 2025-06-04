"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schema (optional confirmation parameter)
const clearWishlistSchema = z.object({
  confirm: z.boolean().optional().default(false),
});

type ClearWishlistData = z.infer<typeof clearWishlistSchema>;

// Return type
type ClearWishlistResult =
  | {
      success: true;
      message: string;
      deletedCount: number;
    }
  | { success: false; error: string };

export async function clearWishlist(data?: ClearWishlistData): Promise<ClearWishlistResult> {
  try {
    // 1. Validate input - ensure validatedData is always defined
    const validatedData = clearWishlistSchema.parse(data || {});
    const { confirm } = validatedData;

    // 2. Create Supabase client
    const supabase = createClient();

    // 3. Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "Bạn cần đăng nhập để xóa danh sách yêu thích",
      };
    }

    // 4. Get current wishlist count
    const { count: currentCount, error: countError } = await supabase
      .from("wishlists")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (countError) {
      return {
        success: false,
        error: countError.message || "Không thể kiểm tra danh sách yêu thích",
      };
    }

    const itemCount = currentCount || 0;

    if (itemCount === 0) {
      return {
        success: true,
        message: "Danh sách yêu thích đã trống",
        deletedCount: 0,
      };
    }

    // 5. Require confirmation for non-empty wishlist
    if (!confirm && itemCount > 0) {
      return {
        success: false,
        error: `Bạn có ${itemCount} sản phẩm trong danh sách yêu thích. Vui lòng xác nhận để xóa tất cả.`,
      };
    }

    // 6. Clear all wishlist items for the user
    const { error: deleteError } = await supabase
      .from("wishlists")
      .delete()
      .eq("user_id", user.id);

    if (deleteError) {
      return {
        success: false,
        error: deleteError.message || "Không thể xóa danh sách yêu thích",
      };
    }

    return {
      success: true,
      message: `Đã xóa thành công ${itemCount} sản phẩm khỏi danh sách yêu thích`,
      deletedCount: itemCount,
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
      error: "Đã xảy ra lỗi không mong muốn khi xóa danh sách yêu thích",
    };
  }
} 