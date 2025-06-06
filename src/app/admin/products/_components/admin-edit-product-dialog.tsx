"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUpdateProduct } from "@/hooks/admin/products";
import { useAdminCategories } from "@/hooks/admin/categories";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/types/custom.types";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

const editProductSchema = z.object({
  name: z
    .string()
    .min(3, "Tên sản phẩm phải có ít nhất 3 ký tự")
    .max(255, "Tên sản phẩm tối đa 255 ký tự"),
  slug: z
    .string()
    .min(3, "Slug phải có ít nhất 3 ký tự")
    .max(255, "Slug tối đa 255 ký tự")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug chỉ được chứa chữ thường, số và dấu gạch ngang"
    ),
  description: z.string().optional(),
  shortDescription: z
    .string()
    .max(500, "Mô tả ngắn tối đa 500 ký tự")
    .optional(),
  sku: z.string().optional(),
  price: z.number().positive("Giá phải lớn hơn 0"),
  comparePrice: z.number().positive("Giá so sánh phải lớn hơn 0").optional(),
  costPrice: z.number().positive("Giá gốc phải lớn hơn 0").optional(),
  stockQuantity: z.number().int().min(0, "Số lượng tồn kho không thể âm"),
  lowStockThreshold: z
    .number()
    .int()
    .min(0, "Ngưỡng tồn kho thấp không thể âm"),
  categoryId: z.number().positive("Vui lòng chọn danh mục").optional(),
  brand: z.string().max(100, "Thương hiệu tối đa 100 ký tự").optional(),
  weight: z.number().positive("Trọng lượng phải lớn hơn 0").optional(),
  tags: z.string().optional(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  metaTitle: z.string().max(255, "Meta title tối đa 255 ký tự").optional(),
  metaDescription: z
    .string()
    .max(500, "Meta description tối đa 500 ký tự")
    .optional(),
});

type EditProductFormData = z.infer<typeof editProductSchema>;

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
  const [tagsInput, setTagsInput] = useState("");

  const { toast } = useToast();

  // Categories for select
  const { data: categoriesData } = useAdminCategories({
    isActive: true,
    limit: 100,
  });

  const form = useForm<EditProductFormData>({
    resolver: zodResolver(editProductSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      shortDescription: "",
      sku: "",
      price: 0,
      comparePrice: 0,
      costPrice: 0,
      stockQuantity: 0,
      lowStockThreshold: 10,
      brand: "",
      weight: 0,
      tags: "",
      isActive: true,
      isFeatured: false,
      metaTitle: "",
      metaDescription: "",
    },
  });

  const updateProduct = useUpdateProduct({
    onSuccess: () => {
      setOpen(false);
    },
  });

  // Load product data when dialog opens
  useEffect(() => {
    if (open && product) {
      form.reset({
        name: product.name || "",
        slug: product.slug || "",
        description: product.description || "",
        shortDescription: product.short_description || "",
        sku: product.sku || "",
        price: product.price || 0,
        comparePrice: product.compare_price || 0,
        costPrice: product.cost_price || 0,
        stockQuantity: product.stock_quantity || 0,
        lowStockThreshold: product.low_stock_threshold || 10,
        categoryId: product.category_id || undefined,
        brand: product.brand || "",
        weight: product.weight || 0,
        isActive: product.is_active ?? true,
        isFeatured: product.is_featured ?? false,
        metaTitle: product.meta_title || "",
        metaDescription: product.meta_description || "",
      });

      // Set tags input
      const tags = product.tags || [];
      setTagsInput(tags.join(", "));
    }
  }, [open, product, form]);

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    const slug = value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    form.setValue("slug", slug);
  };

  const onSubmit = (data: EditProductFormData) => {
    // Process tags
    const tagsArray = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    // Only send changed fields
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      productId: product.id,
    };

    // Add only fields that have changed
    if (data.name !== product.name) updateData.name = data.name;
    if (data.slug !== product.slug) updateData.slug = data.slug;
    if (data.description !== (product.description || ""))
      updateData.description = data.description || undefined;
    if (data.shortDescription !== (product.short_description || ""))
      updateData.shortDescription = data.shortDescription || undefined;
    if (data.sku !== (product.sku || ""))
      updateData.sku = data.sku || undefined;
    if (data.price !== product.price) updateData.price = data.price;
    if (data.comparePrice !== (product.compare_price || 0))
      updateData.comparePrice = data.comparePrice || undefined;
    if (data.costPrice !== (product.cost_price || 0))
      updateData.costPrice = data.costPrice || undefined;
    if (data.stockQuantity !== product.stock_quantity)
      updateData.stockQuantity = data.stockQuantity;
    if (data.lowStockThreshold !== product.low_stock_threshold)
      updateData.lowStockThreshold = data.lowStockThreshold;
    if (data.categoryId !== product.category_id)
      updateData.categoryId = data.categoryId || undefined;
    if (data.brand !== (product.brand || ""))
      updateData.brand = data.brand || undefined;
    if (data.weight !== (product.weight || 0))
      updateData.weight = data.weight || undefined;
    if (data.isActive !== product.is_active)
      updateData.isActive = data.isActive;
    if (data.isFeatured !== product.is_featured)
      updateData.isFeatured = data.isFeatured;
    if (data.metaTitle !== (product.meta_title || ""))
      updateData.metaTitle = data.metaTitle || undefined;
    if (data.metaDescription !== (product.meta_description || ""))
      updateData.metaDescription = data.metaDescription || undefined;

    // Check tags
    const currentTags = product.tags || [];
    const newTags = tagsArray;
    if (JSON.stringify(currentTags.sort()) !== JSON.stringify(newTags.sort())) {
      updateData.tags = newTags.length > 0 ? newTags : [];
    }

    // Only update if there are changes
    if (Object.keys(updateData).length === 1) {
      // Only productId
      toast({
        title: "Không có thay đổi",
        description: "Không có thông tin nào được thay đổi",
      });
      return;
    }

    updateProduct.mutate(updateData);
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên sản phẩm *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập tên sản phẩm"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleNameChange(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug *</FormLabel>
                    <FormControl>
                      <Input placeholder="slug-san-pham" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input placeholder="SP001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Danh mục</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(
                          value === "none" ? undefined : Number(value)
                        )
                      }
                      value={field.value?.toString() || "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn danh mục" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Không có danh mục</SelectItem>
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
            </div>

            <FormField
              control={form.control}
              name="shortDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả ngắn</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả ngắn về sản phẩm"
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả chi tiết</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả chi tiết về sản phẩm"
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá bán *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
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
                    <FormLabel>Giá so sánh</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="costPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá gốc</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Inventory */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stockQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số lượng tồn kho *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
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
                    <FormLabel>Ngưỡng cảnh báo tồn kho thấp</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="10"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Additional info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thương hiệu</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập thương hiệu" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trọng lượng (kg)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tags */}
            <FormField
              control={form.control}
              name="tags"
              render={() => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
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

            {/* SEO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="metaTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Meta title cho SEO" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metaDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Meta description cho SEO"
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Kích hoạt sản phẩm
                      </FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Sản phẩm nổi bật
                      </FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={updateProduct.isPending}>
                {updateProduct.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Cập nhật sản phẩm
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
