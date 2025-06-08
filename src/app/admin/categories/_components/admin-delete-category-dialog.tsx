"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteCategory } from "@/hooks/admin/categories";
import { Category } from "@/types/custom.types";
import { Loader2 } from "lucide-react";

interface AdminDeleteCategoryDialogProps {
  category: Category;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminDeleteCategoryDialog({
  category,
  open,
  onOpenChange,
}: AdminDeleteCategoryDialogProps) {
  const deleteCategoryMutation = useDeleteCategory({
    onSuccess: () => {
      onOpenChange(false);
    },
  });

  const handleDelete = () => {
    deleteCategoryMutation.mutate({
      categoryId: category.id,
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa danh mục</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa danh mục{" "}
            <strong>&ldquo;{category.name}&rdquo;</strong>? Hành động này không
            thể hoàn tác.
            <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-md">
              <p className="text-orange-800 text-sm">
                ⚠️ Tất cả sản phẩm trong danh mục này sẽ được chuyển về trạng
                thái không có danh mục.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteCategoryMutation.isPending}>
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteCategoryMutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteCategoryMutation.isPending && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Xóa danh mục
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
