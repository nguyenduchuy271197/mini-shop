"use server";

import { createClient } from "@/lib/supabase/server";

// Return type
type UploadAvatarResult =
  | { success: true; message: string; avatarUrl: string }
  | { success: false; error: string };

export async function uploadAvatar(file: File): Promise<UploadAvatarResult> {
  try {
    // 1. Validate file
    if (!file) {
      return {
        success: false,
        error: "Vui lòng chọn file ảnh",
      };
    }

    // Check file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: "Chỉ chấp nhận file ảnh định dạng JPEG, PNG, WebP hoặc GIF",
      };
    }

    // Check file size (1MB limit)
    const maxSize = 1 * 1024 * 1024; // 1MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: "Kích thước file không được vượt quá 1MB",
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
        error: "Người dùng chưa đăng nhập",
      };
    }

    // 4. Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    // 5. Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      return {
        success: false,
        error: uploadError.message || "Không thể tải lên ảnh đại diện",
      };
    }

    if (!uploadData) {
      return {
        success: false,
        error: "Không thể tải lên ảnh đại diện",
      };
    }

    // 6. Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(uploadData.path);

    // 7. Update user profile with new avatar URL
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      // Try to delete uploaded file if profile update fails
      await supabase.storage.from("avatars").remove([uploadData.path]);
      
      return {
        success: false,
        error: updateError.message || "Không thể cập nhật ảnh đại diện",
      };
    }

    return {
      success: true,
      message: "Tải lên ảnh đại diện thành công!",
      avatarUrl: publicUrl,
    };
  } catch  {
    return {
      success: false,
      error: "Đã xảy ra lỗi không mong muốn khi tải lên ảnh đại diện",
    };
  }
}

// Function to delete avatar
export async function deleteAvatar(): Promise<UploadAvatarResult> {
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

    // 3. Get current avatar URL
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .single();

    if (profileError) {
      return {
        success: false,
        error: "Không thể lấy thông tin ảnh đại diện",
      };
    }

    // 4. Update profile to remove avatar
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        avatar_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      return {
        success: false,
        error: updateError.message || "Không thể xóa ảnh đại diện",
      };
    }

    // 5. Delete file from storage if exists
    if (profile?.avatar_url) {
      try {
        // Extract file path from URL
        const url = new URL(profile.avatar_url);
        const pathParts = url.pathname.split('/');
        const filePath = pathParts.slice(-2).join('/'); // Get userId/filename.ext

        await supabase.storage.from("avatars").remove([filePath]);
      } catch (error) {
        // Continue even if file deletion fails
        console.error("Không thể xóa file từ storage:", error);
      }
    }

    return {
      success: true,
      message: "Xóa ảnh đại diện thành công!",
      avatarUrl: "",
    };
  } catch  {
    return {
      success: false,
      error: "Đã xảy ra lỗi không mong muốn khi xóa ảnh đại diện",
    };
  }
}