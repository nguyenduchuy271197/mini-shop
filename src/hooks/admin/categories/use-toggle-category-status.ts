"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ToggleCategoryStatusData {
  categoryId: number;
  isActive: boolean;
}

export function useToggleCategoryStatus() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ categoryId, isActive }: ToggleCategoryStatusData) => {
      const supabase = createClient();

      // Check admin authorization
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Bạn cần đăng nhập để thực hiện thao tác này");
      }

      // Check if user is admin
      const { data: userRole, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (roleError || !userRole || userRole.role !== "admin") {
        throw new Error("Bạn không có quyền thực hiện thao tác này");
      }

      // Update category status
      const { data, error } = await supabase
        .from("categories")
        .update({ is_active: isActive })
        .eq("id", categoryId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message || "Không thể cập nhật trạng thái danh mục");
      }

      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch admin categories
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.admin.categories.all,
      });

      // Also invalidate public categories
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.categories.all,
      });

      toast({
        title: "Thành công",
        description: `Danh mục đã được ${variables.isActive ? "kích hoạt" : "tạm dừng"}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export type { ToggleCategoryStatusData }; 