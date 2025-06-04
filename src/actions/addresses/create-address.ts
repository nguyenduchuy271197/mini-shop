"use server";

import { createClient } from "@/lib/supabase/server";
import { Address } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const createAddressSchema = z.object({
  type: z.enum(["shipping", "billing"], {
    required_error: "Loại địa chỉ là bắt buộc",
  }),
  first_name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  last_name: z.string().min(2, "Họ phải có ít nhất 2 ký tự"),
  company: z.string().optional(),
  address_line_1: z.string().min(5, "Địa chỉ phải có ít nhất 5 ký tự"),
  address_line_2: z.string().optional(),
  city: z.string().min(2, "Thành phố phải có ít nhất 2 ký tự"),
  state: z.string().min(2, "Tỉnh/Thành phải có ít nhất 2 ký tự"),
  postal_code: z.string().min(4, "Mã bưu điện phải có ít nhất 4 ký tự"),
  country: z.string().min(2, "Quốc gia phải có ít nhất 2 ký tự").default("VN"),
  phone: z.string().optional(),
  is_default: z.boolean().optional().default(false),
});

type CreateAddressData = z.infer<typeof createAddressSchema>;

// Return type
type CreateAddressResult =
  | {
      success: true;
      message: string;
      address: Address;
    }
  | { success: false; error: string };

export async function createAddress(data: CreateAddressData): Promise<CreateAddressResult> {
  try {
    // 1. Validate input
    const validatedData = createAddressSchema.parse(data);

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
        error: "Bạn cần đăng nhập để tạo địa chỉ",
      };
    }

    // 4. Check if user already has an address of this type
    const { data: existingAddresses, error: checkError } = await supabase
      .from("addresses")
      .select("id, is_default")
      .eq("user_id", user.id)
      .eq("type", validatedData.type);

    if (checkError) {
      return {
        success: false,
        error: checkError.message || "Không thể kiểm tra địa chỉ hiện có",
      };
    }

    // 5. Set as default if this is the first address of this type or explicitly requested
    const isFirstAddress = !existingAddresses || existingAddresses.length === 0;
    const shouldBeDefault = validatedData.is_default || isFirstAddress;

    // 6. If setting as default, unset current default
    if (shouldBeDefault && existingAddresses && existingAddresses.length > 0) {
      const { error: unsetError } = await supabase
        .from("addresses")
        .update({ 
          is_default: false,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("type", validatedData.type)
        .eq("is_default", true);

      if (unsetError) {
        return {
          success: false,
          error: unsetError.message || "Không thể cập nhật địa chỉ mặc định hiện tại",
        };
      }
    }

    // 7. Prepare data for insertion
    const insertData = {
      user_id: user.id,
      type: validatedData.type,
      first_name: validatedData.first_name,
      last_name: validatedData.last_name,
      company: validatedData.company || null,
      address_line_1: validatedData.address_line_1,
      address_line_2: validatedData.address_line_2 || null,
      city: validatedData.city,
      state: validatedData.state,
      postal_code: validatedData.postal_code,
      country: validatedData.country,
      phone: validatedData.phone || null,
      is_default: shouldBeDefault,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 8. Insert new address
    const { data: newAddress, error: insertError } = await supabase
      .from("addresses")
      .insert(insertData)
      .select()
      .single();

    if (insertError) {
      return {
        success: false,
        error: insertError.message || "Không thể tạo địa chỉ",
      };
    }

    if (!newAddress) {
      return {
        success: false,
        error: "Không thể tạo địa chỉ",
      };
    }

    return {
      success: true,
      message: `Địa chỉ ${validatedData.type === "shipping" ? "giao hàng" : "thanh toán"} đã được tạo thành công`,
      address: newAddress,
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
      error: "Đã xảy ra lỗi không mong muốn khi tạo địa chỉ",
    };
  }
} 