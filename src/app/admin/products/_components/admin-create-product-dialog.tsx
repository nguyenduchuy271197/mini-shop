"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useCreateProduct } from "@/hooks/admin/products";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AdminProductForm, ProductFormData } from "./admin-product-form";

interface AdminCreateProductDialogProps {
  children: React.ReactNode;
}

export function AdminCreateProductDialog({
  children,
}: AdminCreateProductDialogProps) {
  const [open, setOpen] = useState(false);

  const createProduct = useCreateProduct({
    onSuccess: () => {
      toast.success("Sản phẩm đã được tạo thành công");
      setOpen(false);
    },
    onError: (error) => {
      toast.error("Có lỗi xảy ra khi tạo sản phẩm: " + String(error));
    },
  });

  const handleSubmit = (data: ProductFormData) => {
    // Remove undefined and 0 values for optional fields
    const productData = {
      name: data.name,
      slug: data.slug,
      description: data.description || undefined,
      shortDescription: data.shortDescription || undefined,
      sku: data.sku || undefined,
      price: data.price,
      comparePrice: data.comparePrice || undefined,
      costPrice: data.costPrice || undefined,
      stockQuantity: data.stockQuantity,
      lowStockThreshold: data.lowStockThreshold,
      categoryId: data.categoryId || undefined,
      brand: data.brand || undefined,
      weight: data.weight || undefined,
      tags: data.tags && data.tags.length > 0 ? data.tags : undefined,
      images: data.images && data.images.length > 0 ? data.images : undefined,
      isActive: data.isActive,
      isFeatured: data.isFeatured,
      metaTitle: data.metaTitle || undefined,
      metaDescription: data.metaDescription || undefined,
    };

    createProduct.mutate(productData);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo sản phẩm mới</DialogTitle>
          <DialogDescription>
            Nhập thông tin để tạo sản phẩm mới
          </DialogDescription>
        </DialogHeader>

        <AdminProductForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createProduct.isPending}
          submitText="Tạo sản phẩm"
        />
      </DialogContent>
    </Dialog>
  );
}
