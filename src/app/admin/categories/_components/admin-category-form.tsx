"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { useUploadFile } from "@/hooks/admin/files";
import { Category } from "@/types/custom.types";
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
import { Switch } from "@/components/ui/switch";
import { Loader2, X, Upload } from "lucide-react";

// Shared schema for both create and edit
export const categoryFormSchema = z.object({
  name: z
    .string()
    .min(1, "Tên danh mục là bắt buộc")
    .max(100, "Tên danh mục tối đa 100 ký tự"),
  slug: z.string().min(1, "Slug là bắt buộc").max(100, "Slug tối đa 100 ký tự"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  sortOrder: z
    .number()
    .min(0, "Thứ tự sắp xếp phải lớn hơn hoặc bằng 0")
    .optional(),
  isActive: z.boolean(),
});

export type CategoryFormData = z.infer<typeof categoryFormSchema>;

interface AdminCategoryFormProps {
  mode: "create" | "edit";
  category?: Category;
  onSubmit: (data: CategoryFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  submitText?: string;
  cancelText?: string;
}

export function AdminCategoryForm({
  mode,
  category,
  onSubmit,
  onCancel,
  isLoading = false,
  submitText,
  cancelText = "Hủy",
}: AdminCategoryFormProps) {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      imageUrl: "",
      sortOrder: 0,
      isActive: true,
    },
  });

  const uploadFileMutation = useUploadFile({
    onSuccess: (result) => {
      setUploadedImageUrl(result.publicUrl);
      form.setValue("imageUrl", result.publicUrl);
    },
  });

  // Load category data for edit mode
  useEffect(() => {
    if (mode === "edit" && category) {
      const categoryData = {
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        imageUrl: category.image_url || "",
        sortOrder: category.sort_order,
        isActive: category.is_active,
      };

      form.reset(categoryData);
      setUploadedImageUrl(category.image_url || "");
    }
  }, [mode, category, form]);

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    if (mode === "create") {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      form.setValue("slug", slug);
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("Chỉ hỗ trợ file ảnh (JPEG, PNG, GIF, WebP)");
      return;
    }

    // Validate file size (max 1MB)
    if (file.size > 1024 * 1024) {
      alert("Kích thước file tối đa 1MB");
      return;
    }

    // Generate unique file path
    const fileExtension = file.name.split(".").pop() || "";
    const fileName = `category-${Date.now()}.${fileExtension}`;

    uploadFileMutation.mutate({
      file,
      bucket: "category-images",
      path: fileName,
    });
  };

  // Clear image
  const clearImage = () => {
    setUploadedImageUrl("");
    form.setValue("imageUrl", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (data: CategoryFormData) => {
    const formData = {
      ...data,
      imageUrl: uploadedImageUrl || data.imageUrl || undefined,
    };
    onSubmit(formData);
  };

  const defaultSubmitText = mode === "create" ? "Tạo danh mục" : "Cập nhật";

  // Watch imageUrl for preview
  const currentImageUrl = uploadedImageUrl || form.watch("imageUrl");
  const hasValidImage = currentImageUrl && currentImageUrl.length > 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên danh mục *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nhập tên danh mục"
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

        {/* Slug */}
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug *</FormLabel>
              <FormControl>
                <Input
                  placeholder="tu-dong-tao-tu-ten"
                  {...field}
                  disabled={mode === "edit"} // Disable slug editing in edit mode
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Mô tả danh mục (tùy chọn)"
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Image Upload */}
        <FormField
          control={form.control}
          name="imageUrl"
          render={() => (
            <FormItem>
              <FormLabel>Ảnh danh mục</FormLabel>
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
                          PNG, JPG, GIF, WebP (Max 1MB)
                        </p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
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

                  {/* Image Preview */}
                  {hasValidImage && (
                    <div className="relative w-full h-48 border-2 border-gray-300 rounded-lg overflow-hidden">
                      <Image
                        src={currentImageUrl}
                        alt="Preview"
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
                        className="absolute top-2 right-2"
                        onClick={clearImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Sort Order */}
        <FormField
          control={form.control}
          name="sortOrder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thứ tự sắp xếp</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  {...field}
                  onChange={(e) =>
                    field.onChange(parseInt(e.target.value) || 0)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Is Active */}
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Kích hoạt danh mục</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Danh mục sẽ hiển thị trên website
                </p>
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

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
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
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            {submitText || defaultSubmitText}
          </Button>
        </div>
      </form>
    </Form>
  );
}
