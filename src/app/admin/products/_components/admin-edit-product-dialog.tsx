"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useUpdateProduct } from "@/hooks/admin/products";
import { Product } from "@/types/custom.types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AdminProductForm, ProductFormData } from "./admin-product-form";

interface AdminEditProductDialogProps {
  children: React.ReactNode;
  product: Product & {
    categories?: {
      id: number;
      name: string;
      slug: string;
    } | null;
  };
}

export function AdminEditProductDialog({
  children,
  product,
}: AdminEditProductDialogProps) {
  const [open, setOpen] = useState(false);

  const updateProduct = useUpdateProduct({
    onSuccess: () => {
      toast.success("Sản phẩm đã được cập nhật thành công");
      setOpen(false);
    },
    onError: (error) => {
      toast.error("Có lỗi xảy ra khi cập nhật sản phẩm: " + String(error));
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

    updateProduct.mutate({
      productId: product.id,
      ...productData,
    });
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa sản phẩm</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin sản phẩm &ldquo;{product.name}&rdquo;
          </DialogDescription>
        </DialogHeader>

        <AdminProductForm
          mode="edit"
          product={product}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={updateProduct.isPending}
          submitText="Cập nhật sản phẩm"
        />
      </DialogContent>
    </Dialog>
  );
}
