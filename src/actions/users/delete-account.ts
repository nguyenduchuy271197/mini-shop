"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schema
const deleteAccountSchema = z.object({
  userId: z.string().uuid("ID người dùng không hợp lệ"),
  confirmPassword: z.string().min(1, "Vui lòng nhập mật khẩu để xác nhận"),
});

type DeleteAccountData = z.infer<typeof deleteAccountSchema>;

// Return type
type DeleteAccountResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function deleteUserAccount(data: DeleteAccountData): Promise<DeleteAccountResult> {
  try {
    // 1. Validate input
    const validatedData = deleteAccountSchema.parse(data);

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
        error: "Người dùng chưa đăng nhập",
      };
    }

    // 4. Check authorization - user can only delete their own account or admin can delete any account
    let canDelete = user.id === validatedData.userId;

    if (!canDelete) {
      // Check if current user is admin
      const { data: adminRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      canDelete = !!adminRole;
    }

    if (!canDelete) {
      return {
        success: false,
        error: "Bạn không có quyền xóa tài khoản này",
      };
    }

    // 5. Verify password (only if deleting own account)
    if (user.id === validatedData.userId) {
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: validatedData.confirmPassword,
      });

      if (verifyError) {
        return {
          success: false,
          error: "Mật khẩu xác nhận không chính xác",
        };
      }
    }

    // 6. Get user profile to clean up avatar
    const { data: profile } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", validatedData.userId)
      .single();

    // 7. Delete avatar from storage if exists
    if (profile?.avatar_url) {
      try {
        const url = new URL(profile.avatar_url);
        const pathParts = url.pathname.split('/');
        const filePath = pathParts.slice(-2).join('/');
        await supabase.storage.from("avatars").remove([filePath]);
      } catch (error) {
        // Continue even if avatar deletion fails
        console.error("Không thể xóa avatar:", error);
      }
    }

    // 8. Delete user data from related tables (handled by CASCADE in schema)
    // The following will be automatically deleted due to CASCADE:
    // - profiles
    // - user_roles  
    // - cart_items
    // - addresses
    // - wishlists
    // - reviews
    // - orders (set user_id to null)

    // 9. Delete user from auth (this must be done by admin)
    if (user.id === validatedData.userId) {
      // User deleting their own account
      const { error: deleteError } = await supabase.auth.admin.deleteUser(
        validatedData.userId
      );

      if (deleteError) {
        return {
          success: false,
          error: deleteError.message || "Không thể xóa tài khoản",
        };
      }
    } else {
      // Admin deleting another user's account
      const { error: deleteError } = await supabase.auth.admin.deleteUser(
        validatedData.userId
      );

      if (deleteError) {
        return {
          success: false,
          error: deleteError.message || "Không thể xóa tài khoản",
        };
      }
    }

    return {
      success: true,
      message: "Xóa tài khoản thành công!",
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
      error: "Đã xảy ra lỗi không mong muốn khi xóa tài khoản",
    };
  }
}

// Function for user to delete their own account (simpler version)
export async function deleteOwnAccount(confirmPassword: string): Promise<DeleteAccountResult> {
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

    // 3. Use main delete function
    return await deleteUserAccount({
      userId: user.id,
      confirmPassword,
    });
  } catch  {
    return {
      success: false,
      error: "Đã xảy ra lỗi không mong muốn khi xóa tài khoản",
    };
  }
}

// Function for admin to deactivate user (soft delete - just remove roles)
export async function deactivateUser(userId: string): Promise<DeleteAccountResult> {
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

    // 3. Check if current user is admin
    const { data: adminRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!adminRole) {
      return {
        success: false,
        error: "Bạn không có quyền thực hiện hành động này",
      };
    }

    // 4. Remove all user roles (deactivate)
    const { error: deleteRolesError } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId);

    if (deleteRolesError) {
      return {
        success: false,
        error: deleteRolesError.message || "Không thể vô hiệu hóa tài khoản",
      };
    }

    return {
      success: true,
      message: "Vô hiệu hóa tài khoản thành công!",
    };
  } catch  {
    return {
      success: false,
      error: "Đã xảy ra lỗi không mong muốn khi vô hiệu hóa tài khoản",
    };
  }
}