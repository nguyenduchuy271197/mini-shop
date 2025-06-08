"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { useAdminCategories } from "@/hooks/admin/categories";
import { useUploadFile } from "@/hooks/admin/files";
import { Product } from "@/types/custom.types";
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
import { MultiTagInput } from "@/components/ui/multi-tag-input";
import { Loader2, Upload, X } from "lucide-react";

// Shared schema for both create and edit
export const productFormSchema = z.object({
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
  tags: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  metaTitle: z.string().max(255, "Meta title tối đa 255 ký tự").optional(),
  metaDescription: z
    .string()
    .max(500, "Meta description tối đa 500 ký tự")
    .optional(),
});

export type ProductFormData = z.infer<typeof productFormSchema>;

interface AdminProductFormProps {
  mode: "create" | "edit";
  product?: Product & {
    categories?: {
      id: number;
      name: string;
      slug: string;
    } | null;
  };
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  submitText?: string;
  cancelText?: string;
}

export function AdminProductForm({
  mode,
  product,
  onSubmit,
  onCancel,
  isLoading = false,
  submitText,
  cancelText = "Hủy",
}: AdminProductFormProps) {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Categories for select
  const { data: categoriesData } = useAdminCategories({
    isActive: true,
    limit: 100,
  });

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
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
      tags: [],
      images: [],
      isActive: true,
      isFeatured: false,
      metaTitle: "",
      metaDescription: "",
    },
  });

  const uploadFileMutation = useUploadFile({
    onSuccess: (result) => {
      const newImages = [...uploadedImages, result.publicUrl];
      setUploadedImages(newImages);
      form.setValue("images", newImages);
    },
  });

  // Load product data for edit mode
  useEffect(() => {
    if (mode === "edit" && product) {
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
        tags: product.tags || [],
      });

      // Set existing images
      const images = product.images || [];
      setUploadedImages(images);
      form.setValue("images", images);
    }
  }, [mode, product, form]);

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    if (mode === "create") {
      const slug = value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      form.setValue("slug", slug);
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    files.forEach((file) => {
      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert("Chỉ hỗ trợ file ảnh (JPEG, PNG, GIF, WebP)");
        return;
      }

      // Validate file size (max 5MB per image)
      if (file.size > 5 * 1024 * 1024) {
        alert("Kích thước file tối đa 5MB");
        return;
      }

      // Generate unique file path
      const fileExtension = file.name.split(".").pop() || "";
      const fileName = `product-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExtension}`;

      uploadFileMutation.mutate({
        file,
        bucket: "product-images",
        path: fileName,
      });
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    form.setValue("images", newImages);
  };

  const handleSubmit = (data: ProductFormData) => {
    // Add images to form data
    const formData = {
      ...data,
      images: uploadedImages,
    };
    onSubmit(formData);
  };

  const defaultSubmitText =
    mode === "create" ? "Tạo sản phẩm" : "Cập nhật sản phẩm";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
                  <Input
                    placeholder="slug-san-pham"
                    {...field}
                    disabled={mode === "edit"} // Disable slug editing in edit mode
                  />
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
                    field.onChange(value === "none" ? undefined : Number(value))
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

        {/* Product Images */}
        <FormField
          control={form.control}
          name="images"
          render={() => (
            <FormItem>
              <FormLabel>Ảnh sản phẩm</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click để upload</span>{" "}
                          hoặc kéo thả file
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF, WebP (Max 5MB mỗi ảnh)
                        </p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {uploadFileMutation.isPending && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang upload...
                    </div>
                  )}

                  {/* Images Preview */}
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {uploadedImages.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <div className="relative w-full h-32 border-2 border-gray-300 rounded-lg overflow-hidden">
                            <Image
                              src={imageUrl}
                              alt={`Product image ${index + 1}`}
                              fill
                              className="object-cover"
                              onError={() => {
                                console.log("Image failed to load");
                              }}
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <MultiTagInput
                  value={field.value || []}
                  onChange={field.onChange}
                  placeholder="Thêm tag và nhấn Enter"
                  maxTags={20}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* SEO */}
        <div className="grid grid-cols-1 gap-4">
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
                  <FormLabel className="text-base">Sản phẩm nổi bật</FormLabel>
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

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading || uploadFileMutation.isPending}
          >
            {cancelText}
          </Button>
          <Button
            type="submit"
            disabled={isLoading || uploadFileMutation.isPending}
          >
            {(isLoading || uploadFileMutation.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {submitText || defaultSubmitText}
          </Button>
        </div>
      </form>
    </Form>
  );
}
