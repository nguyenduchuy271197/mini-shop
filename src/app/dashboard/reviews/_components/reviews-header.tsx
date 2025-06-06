"use client";

import { Star, MessageSquare, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useUserReviews } from "@/hooks/reviews";

export function ReviewsHeader() {
  const { data: reviewsData, isLoading } = useUserReviews({
    limit: 100, // Lấy tất cả để tính thống kê
  });

  const stats = {
    totalReviews: reviewsData?.reviews.length || 0,
    averageRating: reviewsData?.reviews.length
      ? reviewsData.reviews.reduce((sum, review) => sum + review.rating, 0) /
        reviewsData.reviews.length
      : 0,
    helpfulVotes:
      reviewsData?.reviews.reduce(
        (sum, review) => sum + (review.helpful_count || 0),
        0
      ) || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Đánh giá sản phẩm
        </h1>
        <p className="text-gray-600 mt-2">
          Quản lý và theo dõi các đánh giá sản phẩm của bạn
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Tổng đánh giá
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? "..." : stats.totalReviews}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Đánh giá trung bình
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? "..." : stats.averageRating.toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Lượt hữu ích
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? "..." : stats.helpfulVotes}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
