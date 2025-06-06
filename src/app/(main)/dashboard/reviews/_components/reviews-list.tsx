"use client";

import { useState, useEffect } from "react";
import { Filter, SortAsc } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserReviews } from "@/hooks/reviews";
import { ReviewCard } from "./review-card";
import { ReviewsEmpty } from "./reviews-empty";
import { ReviewsSkeleton } from "./reviews-skeleton";

export function ReviewsList() {
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "rating_high" | "rating_low"
  >("newest");

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    data: reviewsData,
    isLoading,
    error,
  } = useUserReviews({
    page,
    limit: 10,
    sortBy,
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
        <p className="text-red-600">Có lỗi xảy ra khi tải danh sách đánh giá</p>
      </div>
    );
  }

  if (!reviewsData?.reviews.length) {
    return <ReviewsEmpty />;
  }

  const { reviews, pagination } = reviewsData;

  return (
    <div className="space-y-6">
      {/* Filters and Sorting */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            Hiển thị {reviews.length} trong tổng số {pagination.total} đánh giá
          </span>
        </div>

        <div className="flex items-center gap-2">
          <SortAsc className="h-4 w-4 text-gray-500" />
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
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid gap-6">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
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
