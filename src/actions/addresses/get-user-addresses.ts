"use server";

import { createClient } from "@/lib/supabase/server";
import { Address } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const getUserAddressesSchema = z.object({
  userId: z.string().uuid("ID người dùng không hợp lệ").optional(),
  type: z.enum(["shipping", "billing"]).optional(),
});

type GetUserAddressesData = z.infer<typeof getUserAddressesSchema>;

// Return type
type GetUserAddressesResult =
  | {
      success: true;
      addresses: Address[];
      defaultShipping?: Address;
      defaultBilling?: Address;
    }
  | { success: false; error: string };

export async function getUserAddresses(data?: GetUserAddressesData): Promise<GetUserAddressesResult> {
  try {
    // 1. Validate input
    const validatedData = data ? getUserAddressesSchema.parse(data) : {};

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
        error: "Bạn cần đăng nhập để xem danh sách địa chỉ",
      };
    }

    // 4. Determine target user ID
    const targetUserId = validatedData.userId || user.id;

    // 5. Check authorization - users can only view their own addresses unless admin
    if (targetUserId !== user.id) {
      const { data: userRole, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (roleError || !userRole || userRole.role !== "admin") {
        return {
          success: false,
          error: "Bạn không có quyền xem địa chỉ của người dùng khác",
        };
      }
    }

    // 6. Build query
    let query = supabase
      .from("addresses")
      .select("*")
      .eq("user_id", targetUserId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    // Filter by type if specified
    if (validatedData.type) {
      query = query.eq("type", validatedData.type);
    }

    const { data: addresses, error: addressesError } = await query;

    if (addressesError) {
      return {
        success: false,
        error: addressesError.message || "Không thể lấy danh sách địa chỉ",
      };
    }

    if (!addresses) {
      return {
        success: true,
        addresses: [],
      };
    }

    // 7. Find default addresses
    const defaultShipping = addresses.find(
      (addr) => addr.type === "shipping" && addr.is_default
    );
    const defaultBilling = addresses.find(
      (addr) => addr.type === "billing" && addr.is_default
    );

    return {
      success: true,
      addresses,
      defaultShipping,
      defaultBilling,
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
      error: "Đã xảy ra lỗi không mong muốn khi lấy danh sách địa chỉ",
    };
  }
} 