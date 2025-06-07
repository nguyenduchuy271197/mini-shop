import {
  CheckCircle,
  XCircle,
  Star,
  User,
  Package,
  Calendar,
  ThumbsUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useApproveReview, useRejectReview } from "@/hooks/admin/reviews";
import type { ReviewWithDetails } from "@/hooks/admin/reviews";
import {
  getReviewStatusText,
  getVerificationStatusText,
  getRatingStars,
  getRatingColor,
  formatHelpfulCount,
} from "../_lib/utils";

interface ReviewDetailsProps {
  review: ReviewWithDetails;
  onClose: () => void;
}

export default function ReviewDetails({ review, onClose }: ReviewDetailsProps) {
  const { toast } = useToast();

  const { mutate: approveReview, isPending: isApproving } = useApproveReview({
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã duyệt đánh giá",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description:
          typeof error === "string" ? error : (error as Error).message,
        variant: "destructive",
      });
    },
  });

  const { mutate: rejectReview, isPending: isRejecting } = useRejectReview({
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã từ chối đánh giá",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description:
          typeof error === "string" ? error : (error as Error).message,
        variant: "destructive",
      });
    },
  });

  const statusInfo = getReviewStatusText(review);
  const verificationInfo = getVerificationStatusText(review);
  const isPending = isApproving || isRejecting;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Chi tiết đánh giá</h3>
          <p className="text-sm text-muted-foreground">ID: {review.id}</p>
        </div>
        <div className="flex gap-2">
          <Badge variant={statusInfo.variant}>{statusInfo.text}</Badge>
          <Badge variant={verificationInfo.variant}>
            {verificationInfo.text}
          </Badge>
        </div>
      </div>

      {/* Customer Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Thông tin khách hàng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Tên khách hàng</p>
              <p className="text-sm text-muted-foreground">
                {review.user?.full_name || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">
                {review.user?.email || "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Thông tin sản phẩm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Tên sản phẩm</p>
              <p className="text-sm text-muted-foreground">
                {review.product?.name || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">SKU</p>
              <p className="text-sm text-muted-foreground">
                {review.product?.sku || "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Nội dung đánh giá
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Rating */}
          <div>
            <p className="text-sm font-medium mb-2">Đánh giá</p>
            <div className="flex items-center gap-2">
              <span className={`text-2xl ${getRatingColor(review.rating)}`}>
                {getRatingStars(review.rating)}
              </span>
              <span className="text-lg font-medium">({review.rating}/5)</span>
            </div>
          </div>

          <Separator />

          {/* Title */}
          {review.title && (
            <div>
              <p className="text-sm font-medium mb-2">Tiêu đề</p>
              <p className="text-sm">{review.title}</p>
            </div>
          )}

          {/* Comment */}
          <div>
            <p className="text-sm font-medium mb-2">Nội dung</p>
            <p className="text-sm whitespace-pre-wrap">{review.comment}</p>
          </div>

          <Separator />

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {formatHelpfulCount(review.helpful_count)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {new Date(review.created_at).toLocaleDateString("vi-VN")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        {!review.is_approved && (
          <Button
            onClick={() => approveReview({ reviewId: review.id })}
            disabled={isPending}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Duyệt đánh giá
          </Button>
        )}
        {review.is_approved && (
          <Button
            variant="destructive"
            onClick={() => rejectReview({ reviewId: review.id })}
            disabled={isPending}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Từ chối đánh giá
          </Button>
        )}
      </div>
    </div>
  );
}
