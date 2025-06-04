"use server";

import { createClient } from "@/lib/supabase/server";
import { Profile } from "@/types/custom.types";


// Return type
type GetProfileResult =
  | { success: true; profile: Profile }
  | { success: false; error: string };

export async function getUserProfile(userId?: string): Promise<GetProfileResult> {
  try {
    // 1. Create Supabase client
    const supabase = createClient();

    let targetUserId = userId;

    // 2. If no userId provided, get current user
    if (!targetUserId) {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        return {
          success: false,
          error: "Người dùng chưa đăng nhập",
        };
      }

      targetUserId = user.id;
    }

    // 3. Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", targetUserId)
      .single();

    if (profileError) {
      if (profileError.code === "PGRST116") {
        return {
          success: false,
          error: "Không tìm thấy thông tin người dùng",
        };
      }
      return {
        success: false,
        error: profileError.message || "Không thể lấy thông tin người dùng",
      };
    }

    if (!profile) {
      return {
        success: false,
        error: "Không tìm thấy thông tin người dùng",
      };
    }

    return {
      success: true,
      profile,
    };
  } catch {
    return {
      success: false,
      error: "Đã xảy ra lỗi không mong muốn khi lấy thông tin người dùng",
    };
  }
}

// Function to get profile with user roles
export async function getUserProfileWithRoles(userId?: string): Promise<GetProfileResult & { roles?: string[] }> {
  try {
    // 1. Get basic profile
    const profileResult = await getUserProfile(userId);
    
    if (!profileResult.success) {
      return profileResult;
    }

    // 2. Create Supabase client
    const supabase = createClient();

    let targetUserId = userId;
    if (!targetUserId) {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        return profileResult; // Return profile without roles
      }

      targetUserId = user.id;
    }

    // 3. Get user roles
    const { data: userRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", targetUserId);

    if (rolesError) {
      // Return profile without roles if roles query fails
      return profileResult;
    }

    const roles = userRoles?.map(ur => ur.role) || [];

    return {
      success: true,
      profile: profileResult.profile,
      roles,
    };
  } catch  {
    return {
      success: false,
      error: "Đã xảy ra lỗi không mong muốn khi lấy thông tin người dùng",
    };
  }
} 