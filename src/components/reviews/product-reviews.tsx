"use client";

import { useState, useEffect } from "react";
import { ThumbsUp, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProductReviews, useVoteHelpful } from "@/hooks/reviews";
import { useToast } from "@/hooks/use-toast";
import { RatingStars } from "./rating-stars";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface ProductReviewsProps {
  productId: number;
  showCreateButton?: boolean;
}

export function ProductReviews({
  productId,
  showCreateButton = false,
}: ProductReviewsProps) {
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "rating_high" | "rating_low" | "helpful"
  >("newest");
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    data: reviewsData,
    isLoading,
    error,
  } = useProductReviews({
    productId,
    page,
    limit: 10,
    sortBy,
    onlyApproved: true,
  });

  const voteHelpful = useVoteHelpful({
    onSuccess: () => {
      toast({
        title: "Cảm ơn!",
        description: "Đã ghi nhận đánh giá hữu ích của bạn",
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

  if (!mounted) {
    return <ReviewsSkeleton />;
  }

  if (isLoading) {
    return <ReviewsSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Có lỗi xảy ra khi tải đánh giá</p>
      </div>
    );
  }

  if (!reviewsData?.reviews.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Chưa có đánh giá nào cho sản phẩm này</p>
        {showCreateButton && (
          <p className="text-sm text-gray-500 mt-2">
            Hãy là người đầu tiên đánh giá sản phẩm này!
          </p>
        )}
      </div>
    );
  }

  const { reviews, pagination, summary } = reviewsData;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {summary.averageRating.toFixed(1)}
            </div>
            <RatingStars
              rating={summary.averageRating}
              size="lg"
              className="justify-center mt-1"
            />
            <p className="text-sm text-gray-600 mt-1">
              {summary.totalReviews} đánh giá
            </p>
          </div>

          <div className="flex-1">
            <h4 className="font-medium text-gray-900 mb-3">Phân bố đánh giá</h4>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = summary.ratingDistribution[star.toString()] || 0;
                const percentage =
                  summary.totalReviews > 0
                    ? (count / summary.totalReviews) * 100
                    : 0;

                return (
                  <div key={star} className="flex items-center gap-3 text-sm">
                    <span className="w-8">{star} sao</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-12 text-gray-600">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Đánh giá từ khách hàng ({reviews.length})
        </h3>

        <Select
          value={sortBy}
          onValueChange={(value: typeof sortBy) => setSortBy(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sắp xếp theo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Mới nhất</SelectItem>
            <SelectItem value="oldest">Cũ nhất</SelectItem>
            <SelectItem value="rating_high">Đánh giá cao</SelectItem>
            <SelectItem value="rating_low">Đánh giá thấp</SelectItem>
            <SelectItem value="helpful">Hữu ích nhất</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {review.profiles?.full_name?.charAt(0) || "?"}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {review.profiles?.full_name || "Khách hàng"}
                      </p>
                      <div className="flex items-center gap-2">
                        <RatingStars rating={review.rating} size="sm" />
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(review.created_at), {
                            addSuffix: true,
                            locale: vi,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 sm:ml-auto">
                    {review.is_verified && (
                      <Badge variant="outline" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Đã mua hàng
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  {review.title && (
                    <h4 className="font-medium text-gray-900">
                      {review.title}
                    </h4>
                  )}
                  <p className="text-gray-700">{review.comment}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => voteHelpful.mutate({ reviewId: review.id })}
                    disabled={voteHelpful.isPending}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    Hữu ích ({review.helpful_count || 0})
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={!pagination.hasPrev}
          >
            Trước
          </Button>

          <span className="text-sm text-gray-600 px-4">
            Trang {pagination.page} / {pagination.totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={!pagination.hasNext}
          >
            Sau
          </Button>
        </div>
      )}
    </div>
  );
}

function ReviewsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-8 bg-gray-200 rounded mx-auto" />
            <div className="w-24 h-4 bg-gray-200 rounded mx-auto" />
            <div className="w-20 h-3 bg-gray-200 rounded mx-auto" />
          </div>
          <div className="flex-1 space-y-3">
            <div className="w-32 h-4 bg-gray-200 rounded" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-3 bg-gray-200 rounded" />
                <div className="flex-1 h-2 bg-gray-200 rounded" />
                <div className="w-8 h-3 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div className="space-y-2">
                    <div className="w-24 h-4 bg-gray-200 rounded" />
                    <div className="w-32 h-3 bg-gray-200 rounded" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="w-48 h-4 bg-gray-200 rounded" />
                  <div className="w-full h-3 bg-gray-200 rounded" />
                  <div className="w-3/4 h-3 bg-gray-200 rounded" />
                </div>
                <div className="w-24 h-8 bg-gray-200 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
