"use server";

import { createClient } from "@/lib/supabase/server";
import { Address } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const setDefaultAddressSchema = z.object({
  addressId: z.number().positive("ID địa chỉ không hợp lệ"),
  type: z.enum(["shipping", "billing"], {
    required_error: "Loại địa chỉ là bắt buộc",
  }),
});

type SetDefaultAddressData = z.infer<typeof setDefaultAddressSchema>;

// Return type
type SetDefaultAddressResult =
  | {
      success: true;
      message: string;
      address: Address;
    }
  | { success: false; error: string };

export async function setDefaultAddress(data: SetDefaultAddressData): Promise<SetDefaultAddressResult> {
  try {
    // 1. Validate input
    const { addressId, type } = setDefaultAddressSchema.parse(data);

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
        error: "Bạn cần đăng nhập để đặt địa chỉ mặc định",
      };
    }

    // 4. Get existing address to check ownership and type
    const { data: existingAddress, error: fetchError } = await supabase
      .from("addresses")
      .select("*")
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

    // 5. Check authorization - user can only set default for their own addresses
    if (existingAddress.user_id !== user.id) {
      return {
        success: false,
        error: "Bạn không có quyền đặt địa chỉ này làm mặc định",
      };
    }

    // 6. Check if address type matches the requested type
    if (existingAddress.type !== type) {
      return {
        success: false,
        error: `Địa chỉ này không phải là loại ${type === "shipping" ? "giao hàng" : "thanh toán"}`,
      };
    }

    // 7. Check if address is already default
    if (existingAddress.is_default) {
      return {
        success: true,
        message: "Địa chỉ này đã là địa chỉ mặc định",
        address: existingAddress,
      };
    }

    // 8. Start transaction - unset current default and set new default
    const { error: unsetError } = await supabase
      .from("addresses")
      .update({ 
        is_default: false,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("type", type)
      .eq("is_default", true);

    if (unsetError) {
      return {
        success: false,
        error: unsetError.message || "Không thể cập nhật địa chỉ mặc định hiện tại",
      };
    }

    // 9. Set new default address
    const { data: updatedAddress, error: setError } = await supabase
      .from("addresses")
      .update({ 
        is_default: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", addressId)
      .select()
      .single();

    if (setError) {
      return {
        success: false,
        error: setError.message || "Không thể đặt địa chỉ mặc định",
      };
    }

    if (!updatedAddress) {
      return {
        success: false,
        error: "Không thể đặt địa chỉ mặc định",
      };
    }

    return {
      success: true,
      message: `Đã đặt địa chỉ làm ${type === "shipping" ? "địa chỉ giao hàng" : "địa chỉ thanh toán"} mặc định`,
      address: updatedAddress,
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
      error: "Đã xảy ra lỗi không mong muốn khi đặt địa chỉ mặc định",
    };
  }
} 