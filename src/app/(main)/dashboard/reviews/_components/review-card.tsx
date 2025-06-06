"use client";

import { useState } from "react";
import {
  Star,
  Edit,
  Trash2,
  Calendar,
  CheckCircle,
  Clock,
  Image as ImageIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useDeleteReview } from "@/hooks/reviews";
import { ReviewWithProduct } from "@/hooks/reviews/use-user-reviews";
import { EditReviewDialog } from "./edit-review-dialog";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import Image from "next/image";

interface ReviewCardProps {
  review: ReviewWithProduct;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { toast } = useToast();

  const deleteReview = useDeleteReview({
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã xóa đánh giá thành công",
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: error,
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
      deleteReview.mutate({ reviewId: review.id });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const getStatusBadge = () => {
    if (review.is_approved) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Đã duyệt
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
        <Clock className="h-3 w-3 mr-1" />
        Chờ duyệt
      </Badge>
    );
  };

  const productImage = review.products?.images?.[0];

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Product Info */}
            <div className="flex gap-4 flex-1">
              {/* Product Image */}
              <div className="flex-shrink-0">
                {productImage ? (
                  <Image
                    src={productImage}
                    alt={review.products?.name || "Sản phẩm"}
                    width={80}
                    height={80}
                    className="rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {review.products?.name || "Sản phẩm đã bị xóa"}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex">{renderStars(review.rating)}</div>
                  <span className="text-sm text-gray-600">
                    {review.rating}/5 sao
                  </span>
                </div>

                {/* Review Title */}
                {review.title && (
                  <h4 className="font-medium text-gray-800 mt-2">
                    {review.title}
                  </h4>
                )}

                {/* Review Comment */}
                <p className="text-gray-600 mt-2 line-clamp-3">
                  {review.comment}
                </p>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDistanceToNow(new Date(review.created_at), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </div>

                  {review.is_verified && (
                    <Badge variant="outline" className="text-xs">
                      Đã mua hàng
                    </Badge>
                  )}

                  {review.helpful_count > 0 && (
                    <span>{review.helpful_count} lượt hữu ích</span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 lg:items-end">
              {getStatusBadge()}

              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditDialog(true)}
                  disabled={deleteReview.isPending}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Sửa
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleteReview.isPending}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Xóa
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditReviewDialog
        review={review}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
    </>
  );
}
