"use server";

import { createClient } from "@/lib/supabase/server";
import { Address } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const updateAddressSchema = z.object({
  addressId: z.number().positive("ID địa chỉ không hợp lệ"),
  type: z.enum(["shipping", "billing"]).optional(),
  first_name: z.string().min(2, "Tên phải có ít nhất 2 ký tự").optional(),
  last_name: z.string().min(2, "Họ phải có ít nhất 2 ký tự").optional(),
  company: z.string().optional(),
  address_line_1: z.string().min(5, "Địa chỉ phải có ít nhất 5 ký tự").optional(),
  address_line_2: z.string().optional(),
  city: z.string().min(2, "Thành phố phải có ít nhất 2 ký tự").optional(),
  state: z.string().min(2, "Tỉnh/Thành phải có ít nhất 2 ký tự").optional(),
  postal_code: z.string().min(4, "Mã bưu điện phải có ít nhất 4 ký tự").optional(),
  country: z.string().min(2, "Quốc gia phải có ít nhất 2 ký tự").optional(),
  phone: z.string().optional(),
  is_default: z.boolean().optional(),
});

type UpdateAddressData = z.infer<typeof updateAddressSchema>;

// Return type
type UpdateAddressResult =
  | {
      success: true;
      message: string;
      address: Address;
    }
  | { success: false; error: string };

export async function updateAddress(data: UpdateAddressData): Promise<UpdateAddressResult> {
  try {
    // 1. Validate input
    const { addressId, ...updateFields } = updateAddressSchema.parse(data);

    // Check if there are fields to update
    if (Object.keys(updateFields).length === 0) {
      return {
        success: false,
        error: "Không có thông tin nào để cập nhật",
      };
    }

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
        error: "Bạn cần đăng nhập để cập nhật địa chỉ",
      };
    }

    // 4. Get existing address to check ownership
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

    // 5. Check authorization - user can only update their own addresses
    if (existingAddress.user_id !== user.id) {
      return {
        success: false,
        error: "Bạn không có quyền cập nhật địa chỉ này",
      };
    }

    // 6. Handle type change validation
    if (updateFields.type && updateFields.type !== existingAddress.type) {
      // Check if changing type is allowed (e.g., don't allow if address is used in orders)
      const { data: ordersUsingAddress, error: orderCheckError } = await supabase
        .from("orders")
        .select("id")
        .eq("user_id", user.id)
        .in("status", ["pending", "confirmed", "processing"])
        .or(`shipping_address->address_id.eq.${addressId},billing_address->address_id.eq.${addressId}`)
        .limit(1);

      if (orderCheckError) {
        console.error("Error checking orders using address:", orderCheckError);
      }

      if (ordersUsingAddress && ordersUsingAddress.length > 0) {
        return {
          success: false,
          error: "Không thể thay đổi loại địa chỉ đang được sử dụng trong đơn hàng",
        };
      }
    }

    // 7. Handle default address change
    if (updateFields.is_default && !existingAddress.is_default) {
      const addressType = updateFields.type || existingAddress.type;
      
      // Unset current default address of the same type
      const { error: unsetError } = await supabase
        .from("addresses")
        .update({ 
          is_default: false,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("type", addressType)
        .eq("is_default", true);

      if (unsetError) {
        return {
          success: false,
          error: unsetError.message || "Không thể cập nhật địa chỉ mặc định hiện tại",
        };
      }
    }

    // 8. Prepare update data
    const updateData: Record<string, string | boolean | null> = {
      updated_at: new Date().toISOString(),
    };

    // Add only the fields that are being updated
    if (updateFields.type !== undefined) updateData.type = updateFields.type;
    if (updateFields.first_name !== undefined) updateData.first_name = updateFields.first_name;
    if (updateFields.last_name !== undefined) updateData.last_name = updateFields.last_name;
    if (updateFields.company !== undefined) updateData.company = updateFields.company || null;
    if (updateFields.address_line_1 !== undefined) updateData.address_line_1 = updateFields.address_line_1;
    if (updateFields.address_line_2 !== undefined) updateData.address_line_2 = updateFields.address_line_2 || null;
    if (updateFields.city !== undefined) updateData.city = updateFields.city;
    if (updateFields.state !== undefined) updateData.state = updateFields.state;
    if (updateFields.postal_code !== undefined) updateData.postal_code = updateFields.postal_code;
    if (updateFields.country !== undefined) updateData.country = updateFields.country;
    if (updateFields.phone !== undefined) updateData.phone = updateFields.phone || null;
    if (updateFields.is_default !== undefined) updateData.is_default = updateFields.is_default;

    // 9. Update address
    const { data: updatedAddress, error: updateError } = await supabase
      .from("addresses")
      .update(updateData)
      .eq("id", addressId)
      .select()
      .single();

    if (updateError) {
      return {
        success: false,
        error: updateError.message || "Không thể cập nhật địa chỉ",
      };
    }

    if (!updatedAddress) {
      return {
        success: false,
        error: "Không thể cập nhật địa chỉ",
      };
    }

    return {
      success: true,
      message: "Địa chỉ đã được cập nhật thành công",
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
      error: "Đã xảy ra lỗi không mong muốn khi cập nhật địa chỉ",
    };
  }
} 