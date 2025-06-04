"use server";

import { createClient } from "@/lib/supabase/server";

// Return type
type GetUserRoleResult =
  | { success: true; roles: string[]; primaryRole: string | null }
  | { success: false; error: string };

export async function getUserRole(userId: string): Promise<GetUserRoleResult> {
  try {
    // 1. Create Supabase client
    const supabase = createClient();

    // 2. Get current user (for authorization check)
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

    // 3. Check authorization - user can only get their own role unless they're admin
    if (user.id !== userId) {
      // Check if current user is admin
      const { data: adminRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (!adminRole) {
        return {
          success: false,
          error: "Bạn không có quyền xem thông tin này",
        };
      }
    }

    // 4. Get user roles
    const { data: userRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (rolesError) {
      return {
        success: false,
        error: rolesError.message || "Không thể lấy thông tin vai trò",
      };
    }

    const roles = userRoles?.map(ur => ur.role) || [];
    const primaryRole = roles.length > 0 ? roles[0] : null;

    return {
      success: true,
      roles,
      primaryRole,
    };
  } catch  {
    return {
      success: false,
      error: "Đã xảy ra lỗi không mong muốn khi lấy thông tin vai trò",
    };
  }
}

// Function to get current user's role
export async function getCurrentUserRole(): Promise<GetUserRoleResult> {
  try {
    // 1. Create Supabase client
    const supabase = createClient();

    // 2. Get current user
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

    // 3. Get user roles
    const { data: userRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (rolesError) {
      return {
        success: false,
        error: rolesError.message || "Không thể lấy thông tin vai trò",
      };
    }

    const roles = userRoles?.map(ur => ur.role) || [];
    const primaryRole = roles.length > 0 ? roles[0] : null;

    return {
      success: true,
      roles,
      primaryRole,
    };
  } catch  {
    return {
      success: false,
      error: "Đã xảy ra lỗi không mong muốn khi lấy thông tin vai trò",
    };
  }
}

// Function to check if user has specific role
export async function checkUserHasRole(userId: string, role: "customer" | "admin"): Promise<{
  hasRole: boolean;
  error?: string;
}> {
  try {
    // 1. Create Supabase client
    const supabase = createClient();

    // 2. Get current user (for authorization check)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        hasRole: false,
        error: "Người dùng chưa đăng nhập",
      };
    }

    // 3. Check authorization - user can only check their own role unless they're admin
    if (user.id !== userId) {
      // Check if current user is admin
      const { data: adminRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (!adminRole) {
        return {
          hasRole: false,
          error: "Bạn không có quyền xem thông tin này",
        };
      }
    }

    // 4. Check if user has the specific role
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", role)
      .single();

    if (roleError && roleError.code !== "PGRST116") {
      return {
        hasRole: false,
        error: "Không thể kiểm tra vai trò",
      };
    }

    return {
      hasRole: !!userRole,
    };
  } catch  {
    return {
      hasRole: false,
      error: "Đã xảy ra lỗi không mong muốn khi kiểm tra vai trò",
    };
  }
} 