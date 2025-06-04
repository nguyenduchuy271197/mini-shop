"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schema
const deleteAddressSchema = z.object({
  addressId: z.number().positive("ID địa chỉ không hợp lệ"),
});

type DeleteAddressData = z.infer<typeof deleteAddressSchema>;

// Return type
type DeleteAddressResult =
  | {
      success: true;
      message: string;
    }
  | { success: false; error: string };

export async function deleteAddress(data: DeleteAddressData): Promise<DeleteAddressResult> {
  try {
    // 1. Validate input
    const { addressId } = deleteAddressSchema.parse(data);

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
        error: "Bạn cần đăng nhập để xóa địa chỉ",
      };
    }

    // 4. Get existing address to check ownership
    const { data: existingAddress, error: fetchError } = await supabase
      .from("addresses")
      .select("id, user_id, is_default, type")
      .eq("id", addressId)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return {
          success: false,
          error: "Không tìm thấy địa chỉ",
        };
      }
      return {
        success: false,
        error: fetchError.message || "Không thể lấy thông tin địa chỉ",
      };
    }

    if (!existingAddress) {
      return {
        success: false,
        error: "Không tìm thấy địa chỉ",
      };
    }

    // 5. Check authorization - user can only delete their own addresses
    if (existingAddress.user_id !== user.id) {
      return {
        success: false,
        error: "Bạn không có quyền xóa địa chỉ này",
      };
    }

    // 6. Check if this address is being used in any pending orders
    const { data: pendingOrders, error: orderCheckError } = await supabase
      .from("orders")
      .select("id")
      .eq("user_id", user.id)
      .in("status", ["pending", "confirmed", "processing"])
      .or(`shipping_address->address_id.eq.${addressId},billing_address->address_id.eq.${addressId}`)
      .limit(1);

    if (orderCheckError) {
      console.error("Error checking for pending orders:", orderCheckError);
      // Don't block deletion for this error
    }

    if (pendingOrders && pendingOrders.length > 0) {
      return {
        success: false,
        error: "Không thể xóa địa chỉ đang được sử dụng trong đơn hàng chưa hoàn thành",
      };
    }

    // 7. Delete address
    const { error: deleteError } = await supabase
      .from("addresses")
      .delete()
      .eq("id", addressId);

    if (deleteError) {
      return {
        success: false,
        error: deleteError.message || "Không thể xóa địa chỉ",
      };
    }

    // 8. If deleted address was default, set another address as default (if exists)
    if (existingAddress.is_default) {
      const { data: otherAddresses, error: fetchOtherError } = await supabase
        .from("addresses")
        .select("id")
        .eq("user_id", user.id)
        .eq("type", existingAddress.type)
        .limit(1);

      if (!fetchOtherError && otherAddresses && otherAddresses.length > 0) {
        const { error: setDefaultError } = await supabase
          .from("addresses")
          .update({ is_default: true, updated_at: new Date().toISOString() })
          .eq("id", otherAddresses[0].id);

        if (setDefaultError) {
          console.error("Error setting new default address:", setDefaultError);
          // Don't return error here, just log it
        }
      }
    }

    return {
      success: true,
      message: "Địa chỉ đã được xóa thành công",
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
      error: "Đã xảy ra lỗi không mong muốn khi xóa địa chỉ",
    };
  }
} 