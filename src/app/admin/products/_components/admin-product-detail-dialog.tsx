"use client";

import { Product } from "@/types/custom.types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import {
  Package,
  Tag,
  DollarSign,
  Calendar,
  Star,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface AdminProductDetailDialogProps {
  product: Product & {
    categories?: {
      id: number;
      name: string;
      slug: string;
    } | null;
  };
  children: React.ReactNode;
}

export function AdminProductDetailDialog({
  product,
  children,
}: AdminProductDetailDialogProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const getStockStatus = () => {
    if (product.stock_quantity === 0) {
      return { label: "Hết hàng", color: "destructive", icon: AlertTriangle };
    }
    if (product.stock_quantity <= product.low_stock_threshold) {
      return { label: "Sắp hết", color: "warning", icon: AlertTriangle };
    }
    return { label: "Còn hàng", color: "success", icon: CheckCircle };
  };

  const stockStatus = getStockStatus();
  const StockIcon = stockStatus.icon;

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Chi tiết sản phẩm
          </DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về sản phẩm &ldquo;{product.name}&rdquo;
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Image */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Hình ảnh sản phẩm</h3>
                <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <Package className="h-16 w-16" />
                    </div>
                  )}
                </div>
              </div>

              {/* Basic Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Thông tin cơ bản</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Tên sản phẩm
                    </label>
                    <p className="text-base">{product.name}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Slug
                    </label>
                    <p className="text-base font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {product.slug}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      SKU
                    </label>
                    <p className="text-base">{product.sku || "Chưa có"}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Danh mục
                    </label>
                    <p className="text-base">
                      {product.categories?.name || "Chưa phân loại"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Thương hiệu
                    </label>
                    <p className="text-base">{product.brand || "Chưa có"}</p>
                  </div>

                  <div className="flex gap-2">
                    <Badge
                      variant={product.is_active ? "default" : "secondary"}
                    >
                      {product.is_active ? "Đang hoạt động" : "Tạm dừng"}
                    </Badge>
                    {product.is_featured && (
                      <Badge
                        variant="outline"
                        className="text-yellow-600 border-yellow-600"
                      >
                        <Star className="h-3 w-3 mr-1" />
                        Nổi bật
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Pricing */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Thông tin giá
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-sm font-medium text-gray-500">
                    Giá bán
                  </label>
                  <p className="text-xl font-bold text-green-600">
                    {formatPrice(product.price)}
                  </p>
                </div>

                {product.compare_price && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-sm font-medium text-gray-500">
                      Giá so sánh
                    </label>
                    <p className="text-lg text-gray-500 line-through">
                      {formatPrice(product.compare_price)}
                    </p>
                  </div>
                )}

                {product.cost_price && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-sm font-medium text-gray-500">
                      Giá vốn
                    </label>
                    <p className="text-lg text-red-600">
                      {formatPrice(product.cost_price)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Inventory */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Thông tin kho
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-sm font-medium text-gray-500">
                    Số lượng tồn kho
                  </label>
                  <p className="text-xl font-bold">{product.stock_quantity}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-sm font-medium text-gray-500">
                    Ngưỡng cảnh báo
                  </label>
                  <p className="text-lg">{product.low_stock_threshold}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-sm font-medium text-gray-500">
                    Trạng thái kho
                  </label>
                  <div className="flex items-center gap-2">
                    <StockIcon className="h-4 w-4" />
                    <Badge
                      variant={
                        stockStatus.color as
                          | "default"
                          | "secondary"
                          | "destructive"
                          | "outline"
                      }
                    >
                      {stockStatus.label}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Descriptions */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Mô tả sản phẩm</h3>
              <div className="space-y-4">
                {product.short_description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Mô tả ngắn
                    </label>
                    <p className="text-base mt-1">
                      {product.short_description}
                    </p>
                  </div>
                )}

                {product.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Mô tả chi tiết
                    </label>
                    <div className="text-base mt-1 prose prose-sm max-w-none">
                      {product.description}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* SEO */}
            {(product.meta_title || product.meta_description) && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-4">SEO</h3>
                  <div className="space-y-3">
                    {product.meta_title && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Meta Title
                        </label>
                        <p className="text-base">{product.meta_title}</p>
                      </div>
                    )}

                    {product.meta_description && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Meta Description
                        </label>
                        <p className="text-base">{product.meta_description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Timestamps */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Thông tin thời gian
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Ngày tạo
                  </label>
                  <p className="text-base">{formatDate(product.created_at)}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Cập nhật lần cuối
                  </label>
                  <p className="text-base">{formatDate(product.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
