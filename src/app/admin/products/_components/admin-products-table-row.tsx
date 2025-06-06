"use client";

import { useState } from "react";
import { Product } from "@/types/custom.types";
import { useDeleteProduct } from "@/hooks/admin/products";
import { AdminEditProductDialog } from "./admin-edit-product-dialog";
import { AdminQuickStockUpdateDialog } from "./admin-quick-stock-update-dialog";
import { AdminProductDetailDialog } from "./admin-product-detail-dialog";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Edit, MoreHorizontal, Trash2, Eye, Package } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface AdminProductsTableRowProps {
  product: Product & {
    categories?: {
      id: number;
      name: string;
      slug: string;
    } | null;
  };
  isSelected?: boolean;
  onSelect?: (checked: boolean) => void;
}

export function AdminProductsTableRow({
  product,
  isSelected = false,
  onSelect,
}: AdminProductsTableRowProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deleteProduct = useDeleteProduct({
    onSuccess: () => {
      setShowDeleteDialog(false);
    },
  });

  const handleDelete = () => {
    deleteProduct.mutate({
      productId: product.id,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getStockStatus = (quantity: number, threshold: number) => {
    if (quantity === 0) {
      return { text: "Hết hàng", color: "bg-red-100 text-red-800" };
    } else if (quantity <= threshold) {
      return { text: "Sắp hết", color: "bg-yellow-100 text-yellow-800" };
    } else {
      return { text: "Còn hàng", color: "bg-green-100 text-green-800" };
    }
  };

  const stockStatus = getStockStatus(
    product.stock_quantity,
    product.low_stock_threshold
  );

  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4">
          <Checkbox checked={isSelected} onCheckedChange={onSelect} />
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center">
            {product.images?.[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                width={48}
                height={48}
                className="h-12 w-12 rounded-lg object-cover mr-3"
              />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-gray-200 mr-3 flex items-center justify-center">
                <span className="text-gray-400 text-xs">No Image</span>
              </div>
            )}
            <div>
              <div className="font-medium text-gray-900 max-w-xs truncate">
                {product.name}
              </div>
              <div className="text-sm text-gray-500 max-w-xs truncate">
                {product.slug}
              </div>
              {product.sku && (
                <div className="text-xs text-gray-400">SKU: {product.sku}</div>
              )}
            </div>
          </div>
        </td>

        <td className="px-6 py-4">
          <span className="text-sm text-gray-600">
            {product.categories?.name || "Chưa phân loại"}
          </span>
        </td>

        <td className="px-6 py-4">
          <div className="text-sm">
            <div className="font-medium text-gray-900">
              {formatPrice(product.price)}
            </div>
            {product.compare_price && product.compare_price > product.price && (
              <div className="text-xs text-gray-500 line-through">
                {formatPrice(product.compare_price)}
              </div>
            )}
          </div>
        </td>

        <td className="px-6 py-4">
          <div className="text-sm">
            <div className="font-medium">{product.stock_quantity}</div>
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}
            >
              {stockStatus.text}
            </span>
          </div>
        </td>

        <td className="px-6 py-4">
          <div className="flex flex-col gap-1">
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                product.is_active
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {product.is_active ? "Đang bán" : "Tạm dừng"}
            </span>
            {product.is_featured && (
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                Nổi bật
              </span>
            )}
          </div>
        </td>

        <td className="px-6 py-4">
          <span className="text-sm text-gray-600">
            {new Date(product.created_at).toLocaleDateString("vi-VN")}
          </span>
        </td>

        <td className="px-6 py-4 text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Mở menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <AdminProductDetailDialog product={product}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Eye className="mr-2 h-4 w-4" />
                  Xem chi tiết
                </DropdownMenuItem>
              </AdminProductDetailDialog>
              <AdminEditProductDialog product={product}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Edit className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </DropdownMenuItem>
              </AdminEditProductDialog>
              <AdminQuickStockUpdateDialog product={product}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Package className="mr-2 h-4 w-4" />
                  Cập nhật tồn kho
                </DropdownMenuItem>
              </AdminQuickStockUpdateDialog>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onSelect={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      </tr>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa sản phẩm</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa sản phẩm &ldquo;{product.name}&rdquo;?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteProduct.isPending}
            >
              {deleteProduct.isPending ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
