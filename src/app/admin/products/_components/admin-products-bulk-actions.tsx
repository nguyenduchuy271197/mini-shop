"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useBulkUpdateProducts } from "@/hooks/admin/products";
import { useAdminCategories } from "@/hooks/admin/categories";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  MoreHorizontal,
  Trash2,
  Eye,
  Archive,
  Star,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const bulkUpdateSchema = z.object({
  action: z.enum([
    "activate",
    "deactivate",
    "feature",
    "unfeature",
    "update_category",
    "update_price",
    "update_stock",
    "update_brand",
    "add_tags",
  ]),
  // Category update
  categoryId: z.number().optional(),
  // Price update
  price: z.number().positive().optional(),
  comparePrice: z.number().positive().optional(),
  // Stock update
  stockQuantity: z.number().int().min(0).optional(),
  lowStockThreshold: z.number().int().min(0).optional(),
  // Brand update
  brand: z.string().max(100).optional(),
  // Tags update
  tags: z.string().optional(),
});

type BulkUpdateFormData = z.infer<typeof bulkUpdateSchema>;

interface AdminProductsBulkActionsProps {
  selectedProducts: number[];
  onClearSelection: () => void;
}

export function AdminProductsBulkActions({
  selectedProducts,
  onClearSelection,
}: AdminProductsBulkActionsProps) {
  const [open, setOpen] = useState(false);
  const [tagsInput, setTagsInput] = useState("");

  // Categories for select
  const { data: categoriesData } = useAdminCategories({
    isActive: true,
    limit: 100,
  });

  const form = useForm<BulkUpdateFormData>({
    resolver: zodResolver(bulkUpdateSchema),
    defaultValues: {
      action: "activate",
    },
  });

  const bulkUpdate = useBulkUpdateProducts({
    onSuccess: () => {
      setOpen(false);
      onClearSelection();
      form.reset();
      setTagsInput("");
    },
  });

  const watchedAction = form.watch("action");

  const onSubmit = (data: BulkUpdateFormData) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: any = {};

    switch (data.action) {
      case "activate":
        updates.isActive = true;
        break;
      case "deactivate":
        updates.isActive = false;
        break;
      case "feature":
        updates.isFeatured = true;
        break;
      case "unfeature":
        updates.isFeatured = false;
        break;
      case "update_category":
        if (data.categoryId) updates.categoryId = data.categoryId;
        break;
      case "update_price":
        if (data.price) updates.price = data.price;
        if (data.comparePrice) updates.comparePrice = data.comparePrice;
        break;
      case "update_stock":
        if (data.stockQuantity !== undefined)
          updates.stockQuantity = data.stockQuantity;
        if (data.lowStockThreshold !== undefined)
          updates.lowStockThreshold = data.lowStockThreshold;
        break;
      case "update_brand":
        if (data.brand) updates.brand = data.brand;
        break;
      case "add_tags":
        const tags = tagsInput
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0);
        if (tags.length > 0) updates.tags = tags;
        break;
    }

    bulkUpdate.mutate({
      productIds: selectedProducts,
      updates,
    });
  };

  const quickActions = [
    {
      label: "Kích hoạt",
      icon: Eye,
      action: () => {
        bulkUpdate.mutate({
          productIds: selectedProducts,
          updates: { isActive: true },
        });
      },
    },
    {
      label: "Vô hiệu hóa",
      icon: Archive,
      action: () => {
        bulkUpdate.mutate({
          productIds: selectedProducts,
          updates: { isActive: false },
        });
      },
    },
    {
      label: "Đặt nổi bật",
      icon: Star,
      action: () => {
        bulkUpdate.mutate({
          productIds: selectedProducts,
          updates: { isFeatured: true },
        });
      },
    },
    {
      label: "Bỏ nổi bật",
      icon: Star,
      action: () => {
        bulkUpdate.mutate({
          productIds: selectedProducts,
          updates: { isFeatured: false },
        });
      },
    },
  ];

  if (selectedProducts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            {selectedProducts.length} sản phẩm được chọn
          </Badge>
          <Button variant="ghost" size="sm" onClick={onClearSelection}>
            Bỏ chọn
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          {quickActions.map((quickAction, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={quickAction.action}
              disabled={bulkUpdate.isPending}
            >
              <quickAction.icon className="h-4 w-4 mr-1" />
              {quickAction.label}
            </Button>
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4 mr-1" />
                Khác
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Edit className="mr-2 h-4 w-4" />
                    Cập nhật thông tin
                  </DropdownMenuItem>
                </DialogTrigger>
              </Dialog>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa tất cả
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Bulk Update Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cập nhật hàng loạt</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin cho {selectedProducts.length} sản phẩm được
              chọn
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="action"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hành động</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn hành động" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="activate">
                          Kích hoạt sản phẩm
                        </SelectItem>
                        <SelectItem value="deactivate">
                          Vô hiệu hóa sản phẩm
                        </SelectItem>
                        <SelectItem value="feature">Đặt làm nổi bật</SelectItem>
                        <SelectItem value="unfeature">Bỏ nổi bật</SelectItem>
                        <SelectItem value="update_category">
                          Cập nhật danh mục
                        </SelectItem>
                        <SelectItem value="update_price">
                          Cập nhật giá
                        </SelectItem>
                        <SelectItem value="update_stock">
                          Cập nhật tồn kho
                        </SelectItem>
                        <SelectItem value="update_brand">
                          Cập nhật thương hiệu
                        </SelectItem>
                        <SelectItem value="add_tags">Thêm tags</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Conditional fields based on action */}
              {watchedAction === "update_category" && (
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Danh mục mới</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn danh mục" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categoriesData?.categories.map((category) => (
                            <SelectItem
                              key={category.id}
                              value={category.id.toString()}
                            >
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {watchedAction === "update_price" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giá bán mới</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="comparePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giá so sánh mới</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                Number(e.target.value) || undefined
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {watchedAction === "update_stock" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="stockQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số lượng tồn kho mới</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lowStockThreshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngưỡng cảnh báo mới</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="10"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {watchedAction === "update_brand" && (
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thương hiệu mới</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập thương hiệu" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {watchedAction === "add_tags" && (
                <FormField
                  control={form.control}
                  name="tags"
                  render={() => (
                    <FormItem>
                      <FormLabel>Tags cần thêm</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập tags, cách nhau bằng dấu phẩy"
                          value={tagsInput}
                          onChange={(e) => setTagsInput(e.target.value)}
                        />
                      </FormControl>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {tagsInput.split(",").map((tag, index) => {
                          const trimmedTag = tag.trim();
                          if (!trimmedTag) return null;
                          return (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {trimmedTag}
                            </Badge>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={bulkUpdate.isPending}>
                  {bulkUpdate.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Cập nhật
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
