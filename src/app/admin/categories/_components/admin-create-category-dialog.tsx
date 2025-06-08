"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useCreateCategory } from "@/hooks/admin/categories";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AdminCategoryForm, CategoryFormData } from "./admin-category-form";

interface AdminCreateCategoryDialogProps {
  children: React.ReactNode;
}

export function AdminCreateCategoryDialog({
  children,
}: AdminCreateCategoryDialogProps) {
  const [open, setOpen] = useState(false);

  const createCategoryMutation = useCreateCategory({
    onSuccess: () => {
      toast.success("Danh mục đã được tạo thành công");
      setOpen(false);
    },
    onError: (error) => {
      toast.error("Có lỗi xảy ra khi tạo danh mục: " + String(error));
    },
  });

  const handleSubmit = (data: CategoryFormData) => {
    const processedData = {
      ...data,
      imageUrl: data.imageUrl || undefined, // Convert empty string to undefined
    };
    createCategoryMutation.mutate(processedData);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo danh mục mới</DialogTitle>
          <DialogDescription>
            Thêm danh mục mới vào cửa hàng của bạn
          </DialogDescription>
        </DialogHeader>

        <AdminCategoryForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createCategoryMutation.isPending}
          submitText="Tạo danh mục"
        />
      </DialogContent>
    </Dialog>
  );
}
