"use client";

import { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Image from "next/image";
import { Category } from "@/types/custom.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminEditCategoryDialog } from "./admin-edit-category-dialog";
import { AdminDeleteCategoryDialog } from "./admin-delete-category-dialog";
import { useToggleCategoryStatus } from "@/hooks/admin/categories/use-toggle-category-status";
import { MoreHorizontal, Edit, Trash2, Eye, EyeOff } from "lucide-react";

interface AdminCategoriesTableRowProps {
  category: Category;
}

export function AdminCategoriesTableRow({
  category,
}: AdminCategoriesTableRowProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const toggleStatusMutation = useToggleCategoryStatus();

  const handleToggleStatus = () => {
    toggleStatusMutation.mutate({
      categoryId: category.id,
      isActive: !category.is_active,
    });
  };

  return (
    <>
      <tr className="hover:bg-gray-50">
        {/* Category Info */}
        <td className="px-6 py-4">
          <div className="flex items-center">
            {category.image_url && (
              <Image
                src={category.image_url}
                alt={category.name}
                width={40}
                height={40}
                className="h-10 w-10 rounded-lg object-cover mr-3"
              />
            )}
            <div>
              <div className="font-medium text-gray-900">{category.name}</div>
              {category.description && (
                <div className="text-sm text-gray-500 max-w-xs truncate">
                  {category.description}
                </div>
              )}
            </div>
          </div>
        </td>

        {/* Slug */}
        <td className="px-6 py-4">
          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
            {category.slug}
          </code>
        </td>

        {/* Parent Category */}
        <td className="px-6 py-4">
          {category.parent_id ? (
            <span className="text-sm text-gray-600">
              {/* TODO: Show parent category name */}
              Danh mục con
            </span>
          ) : (
            <span className="text-sm text-gray-400">Danh mục gốc</span>
          )}
        </td>

        {/* Status */}
        <td className="px-6 py-4">
          <Badge variant={category.is_active ? "default" : "secondary"}>
            {category.is_active ? "Hoạt động" : "Tạm dừng"}
          </Badge>
        </td>

        {/* Product Count */}
        <td className="px-6 py-4">
          <span className="text-sm text-gray-600">
            {/* TODO: Get actual product count */}0 sản phẩm
          </span>
        </td>

        {/* Created Date */}
        <td className="px-6 py-4">
          <span className="text-sm text-gray-600">
            {format(new Date(category.created_at), "dd/MM/yyyy", {
              locale: vi,
            })}
          </span>
        </td>

        {/* Actions */}
        <td className="px-6 py-4 text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Mở menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleStatus}>
                {category.is_active ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Tạm dừng
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Kích hoạt
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteDialogOpen(true)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      </tr>

      {/* Edit Dialog */}
      <AdminEditCategoryDialog
        category={category}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      {/* Delete Dialog */}
      <AdminDeleteCategoryDialog
        category={category}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </>
  );
}
