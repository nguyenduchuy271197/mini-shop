"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schema
const bulkModerateReviewsSchema = z.object({
  reviewIds: z.array(z.number().int().positive()).min(1, "Phải chọn ít nhất một đánh giá"),
  action: z.enum(["approve", "reject"], {
    errorMap: () => ({ message: "Hành động phải là 'approve' hoặc 'reject'" }),
  }),
  reason: z.string().optional(), // Lý do cho reject action
});

type BulkModerateReviewsResult =
  | {
      success: true;
      message: string;
      results: {
        successful: number;
        failed: number;
        total: number;
        errors: string[];
      };
    }
  | { success: false; error: string };

export async function bulkModerateReviews(
  reviewIds: number[],
  action: "approve" | "reject",
  reason?: string
): Promise<BulkModerateReviewsResult> {
  try {
    // Validate input
    const validatedData = bulkModerateReviewsSchema.parse({
      reviewIds,
      action,
      reason,
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

    // Kiểm tra authorization - chỉ admin mới có thể bulk moderate reviews
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || userRole?.role !== "admin") {
      return {
        success: false,
        error: "Chỉ admin mới có thể quản lý hàng loạt đánh giá",
      };
    }

    // Lấy thông tin các reviews cần moderate
    const { data: reviews, error: fetchError } = await supabase
      .from("reviews")
      .select(`
        id,
        rating,
        is_approved,
        user_id,
        product_id
      `)
      .in("id", validatedData.reviewIds);

    if (fetchError) {
      return {
        success: false,
        error: "Lỗi khi lấy thông tin đánh giá",
      };
    }

    if (!reviews || reviews.length === 0) {
      return {
        success: false,
        error: "Không tìm thấy đánh giá nào với các ID đã chọn",
      };
    }

    // Lấy thông tin profiles và products nếu cần reject
    let profileMap = new Map();
    let productMap = new Map();

    if (validatedData.action === "reject") {
      const userIds = Array.from(new Set(reviews.map(r => r.user_id)));
      const productIds = Array.from(new Set(reviews.map(r => r.product_id)));

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);

      const { data: products } = await supabase
        .from("products")
        .select("id, name")
        .in("id", productIds);

      profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      productMap = new Map(products?.map(p => [p.id, p]) || []);
    }

    let successful = 0;
    let failed = 0;
    const errors: string[] = [];
    const total = reviews.length;

    // Process từng review
    for (const review of reviews) {
      try {
        if (validatedData.action === "approve") {
          // Kiểm tra review đã được approve chưa
          if (review.is_approved) {
            errors.push(`Đánh giá ID ${review.id} đã được phê duyệt từ trước`);
            failed++;
            continue;
          }

          // Approve review
          const { error: updateError } = await supabase
            .from("reviews")
            .update({
              is_approved: true,
              updated_at: new Date().toISOString(),
            })
            .eq("id", review.id);

          if (updateError) {
            errors.push(`Lỗi khi phê duyệt đánh giá ID ${review.id}: ${updateError.message}`);
            failed++;
          } else {
            successful++;
            console.log(`Admin ${user.id} approved review ${review.id}`);
          }
        } else if (validatedData.action === "reject") {
          // Reject (delete) review
          const { error: deleteError } = await supabase
            .from("reviews")
            .delete()
            .eq("id", review.id);

          if (deleteError) {
            errors.push(`Lỗi khi từ chối đánh giá ID ${review.id}: ${deleteError.message}`);
            failed++;
          } else {
            successful++;
            const profileData = profileMap.get(review.user_id);
            const productData = productMap.get(review.product_id);
            
            console.log(`Admin ${user.id} rejected review ${review.id}`, {
              reason: validatedData.reason || "Không đáp ứng tiêu chuẩn",
              user_email: profileData?.email,
              product_name: productData?.name,
            });

            // TODO: Gửi email thông báo rejection cho user
            // await sendRejectionNotification(profileData?.email, productData?.name, validatedData.reason);
          }
        }
      } catch (error) {
        errors.push(`Lỗi khi xử lý đánh giá ID ${review.id}: ${error}`);
        failed++;
      }
    }

    // Tạo message summary
    const actionText = validatedData.action === "approve" ? "phê duyệt" : "từ chối";
    let message = `Đã ${actionText} thành công ${successful}/${total} đánh giá`;
    
    if (failed > 0) {
      message += `. ${failed} đánh giá thất bại`;
    }

    if (validatedData.action === "reject" && validatedData.reason) {
      message += `. Lý do: ${validatedData.reason}`;
    }

    return {
      success: true,
      message,
      results: {
        successful,
        failed,
        total,
        errors,
      },
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
      error: "Đã xảy ra lỗi không mong muốn khi quản lý hàng loạt đánh giá",
    };
  }
} 