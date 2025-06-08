"use client";

import { toast } from "sonner";
import { useUpdateCategory } from "@/hooks/admin/categories";
import { Category } from "@/types/custom.types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminCategoryForm, CategoryFormData } from "./admin-category-form";

interface AdminEditCategoryDialogProps {
  category: Category;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminEditCategoryDialog({
  category,
  open,
  onOpenChange,
}: AdminEditCategoryDialogProps) {
  const updateCategoryMutation = useUpdateCategory({
    onSuccess: () => {
      toast.success("Danh mục đã được cập nhật thành công");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Có lỗi xảy ra khi cập nhật danh mục: " + String(error));
    },
  });

  const handleSubmit = (data: CategoryFormData) => {
    const processedData = {
      categoryId: category.id,
      ...data,
      imageUrl: data.imageUrl || undefined, // Convert empty string to undefined
    };

    updateCategoryMutation.mutate(processedData);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa danh mục</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin danh mục {category.name}
          </DialogDescription>
        </DialogHeader>

        <AdminCategoryForm
          mode="edit"
          category={category}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={updateCategoryMutation.isPending}
          submitText="Cập nhật"
        />
      </DialogContent>
    </Dialog>
  );
}
