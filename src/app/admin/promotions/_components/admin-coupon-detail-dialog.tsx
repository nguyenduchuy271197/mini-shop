"use client";

import { Coupon } from "@/types/custom.types";
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
import {
  Calendar,
  DollarSign,
  Hash,
  ShoppingCart,
  Star,
  Users,
  AlertTriangle,
  CheckCircle,
  Tag,
} from "lucide-react";

interface AdminCouponDetailDialogProps {
  coupon: Coupon;
  children: React.ReactNode;
}

export function AdminCouponDetailDialog({
  coupon,
  children,
}: AdminCouponDetailDialogProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusBadge = () => {
    if (!coupon.is_active) {
      return <Badge variant="secondary">Đã vô hiệu hóa</Badge>;
    }

    const now = new Date();
    const startsAt = new Date(coupon.starts_at);
    const expiresAt = coupon.expires_at ? new Date(coupon.expires_at) : null;

    if (now < startsAt) {
      return <Badge variant="outline">Chưa bắt đầu</Badge>;
    }

    if (expiresAt && now > expiresAt) {
      return <Badge variant="destructive">Đã hết hạn</Badge>;
    }

    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return <Badge variant="destructive">Đã hết lượt sử dụng</Badge>;
    }

    return <Badge variant="default">Đang hoạt động</Badge>;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Chi tiết mã giảm giá
          </DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về mã giảm giá &ldquo;{coupon.code}&rdquo;
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Thông tin cơ bản</h3>
                {getStatusBadge()}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Hash className="h-4 w-4" />
                    Mã coupon
                  </div>
                  <div className="font-mono text-lg font-semibold bg-gray-100 px-3 py-2 rounded">
                    {coupon.code}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Star className="h-4 w-4" />
                    Tên chương trình
                  </div>
                  <div className="font-medium">{coupon.name}</div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Discount Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Thông tin giảm giá
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">Loại giảm giá</div>
                  <Badge variant="outline">
                    {coupon.type === "percentage"
                      ? "Theo phần trăm"
                      : "Số tiền cố định"}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-gray-600">Giá trị</div>
                  <div className="font-semibold text-lg text-green-600">
                    {coupon.type === "percentage"
                      ? `${coupon.value}%`
                      : formatCurrency(coupon.value)}
                  </div>
                </div>

                {coupon.minimum_amount && (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">
                      Đơn hàng tối thiểu
                    </div>
                    <div className="font-medium">
                      {formatCurrency(coupon.minimum_amount)}
                    </div>
                  </div>
                )}

                {coupon.maximum_discount && (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">Giảm giá tối đa</div>
                    <div className="font-medium">
                      {formatCurrency(coupon.maximum_discount)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Usage Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5" />
                Thông tin sử dụng
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">Đã sử dụng</div>
                  <div className="font-semibold text-lg">
                    {coupon.used_count} lần
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-gray-600">Giới hạn sử dụng</div>
                  <div className="font-medium">
                    {coupon.usage_limit
                      ? `${coupon.usage_limit} lần`
                      : "Không giới hạn"}
                  </div>
                </div>
              </div>

              {coupon.usage_limit && (
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">Tiến độ sử dụng</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          (coupon.used_count / coupon.usage_limit) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    {coupon.used_count} / {coupon.usage_limit} lần sử dụng
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Time Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Thời gian hiệu lực
              </h3>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">Bắt đầu</div>
                  <div className="font-medium">
                    {formatDate(coupon.starts_at)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-gray-600">Kết thúc</div>
                  <div className="font-medium">
                    {coupon.expires_at
                      ? formatDate(coupon.expires_at)
                      : "Không giới hạn"}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Creation Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Thông tin tạo</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">Ngày tạo</div>
                  <div className="font-medium">
                    {formatDate(coupon.created_at)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-gray-600">Cập nhật cuối</div>
                  <div className="font-medium">
                    {formatDate(coupon.updated_at)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
