"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateCategory } from "@/hooks/admin/categories";
import { useUploadFile } from "@/hooks/admin/files";
import { Loader2, X, Upload, Link2 } from "lucide-react";

const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Tên danh mục là bắt buộc")
    .max(100, "Tên danh mục tối đa 100 ký tự"),
  slug: z.string().min(1, "Slug là bắt buộc").max(100, "Slug tối đa 100 ký tự"),
  description: z.string().optional(),
  imageUrl: z.string().url("URL ảnh không hợp lệ").optional().or(z.literal("")),
  sortOrder: z
    .number()
    .min(0, "Thứ tự sắp xếp phải lớn hơn hoặc bằng 0")
    .optional(),
  isActive: z.boolean(),
});

type CreateCategoryFormData = z.infer<typeof createCategorySchema>;

interface AdminCreateCategoryDialogProps {
  children: React.ReactNode;
}

export function AdminCreateCategoryDialog({
  children,
}: AdminCreateCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [imageMethod, setImageMethod] = useState<"url" | "upload">("url");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CreateCategoryFormData>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      imageUrl: "",
      sortOrder: 0,
      isActive: true,
    },
  });

  const createCategoryMutation = useCreateCategory({
    onSuccess: () => {
      setOpen(false);
      form.reset();
      setImageMethod("url");
    },
  });

  const uploadFileMutation = useUploadFile({
    onSuccess: (result) => {
      // Set the uploaded image URL to form
      form.setValue("imageUrl", result.publicUrl);
    },
  });

  const onSubmit = (data: CreateCategoryFormData) => {
    const processedData = {
      ...data,
      imageUrl: data.imageUrl || undefined, // Convert empty string to undefined
    };
    createCategoryMutation.mutate(processedData);
  };

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    form.setValue("name", value);

    // Auto-generate slug
    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    form.setValue("slug", slug);
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

  // Watch imageUrl for preview
  const imageUrl = form.watch("imageUrl");
  const hasValidImage = imageUrl && imageUrl.length > 0;

  const clearImage = () => {
    form.setValue("imageUrl", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      onChange={(e) => handleNameChange(e.target.value)}
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
                    <Input placeholder="tu-dong-tao-tu-ten" {...field} />
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

            {/* Image Section */}
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ảnh danh mục</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <Tabs
                        value={imageMethod}
                        onValueChange={(value) =>
                          setImageMethod(value as "url" | "upload")
                        }
                      >
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger
                            value="url"
                            className="flex items-center gap-2"
                          >
                            <Link2 className="h-4 w-4" />
                            URL
                          </TabsTrigger>
                          <TabsTrigger
                            value="upload"
                            className="flex items-center gap-2"
                          >
                            <Upload className="h-4 w-4" />
                            Upload
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="url">
                          <Input
                            placeholder="https://example.com/image.jpg"
                            {...field}
                          />
                        </TabsContent>

                        <TabsContent value="upload">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="block w-full text-sm text-slate-500
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-full file:border-0
                              file:text-sm file:font-semibold
                              file:bg-violet-50 file:text-violet-700
                              hover:file:bg-violet-100"
                          />
                          {uploadFileMutation.isPending && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Đang upload...
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>

                      {/* Image Preview */}
                      {hasValidImage && (
                        <div className="relative w-full h-48 border-2 border-gray-300 rounded-lg overflow-hidden">
                          <Image
                            src={imageUrl}
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
                    <FormLabel className="text-base">
                      Kích hoạt danh mục
                    </FormLabel>
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

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={
                  createCategoryMutation.isPending ||
                  uploadFileMutation.isPending
                }
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={
                  createCategoryMutation.isPending ||
                  uploadFileMutation.isPending
                }
              >
                {(createCategoryMutation.isPending ||
                  uploadFileMutation.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Tạo danh mục
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
