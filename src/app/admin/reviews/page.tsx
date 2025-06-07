"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ReviewWithDetails } from "@/hooks/admin/reviews";
import ReviewsList from "./_components/reviews-list";
import ReviewDetails from "./_components/review-details";

export default function ReviewsPage() {
  const [selectedReview, setSelectedReview] =
    useState<ReviewWithDetails | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleViewDetails = (review: ReviewWithDetails) => {
    setSelectedReview(review);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedReview(null);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Quản Lý Đánh Giá</h1>
        <p className="text-muted-foreground">
          Duyệt, xóa đánh giá không phù hợp
        </p>
      </div>

      <ReviewsList onViewDetails={handleViewDetails} />

      {/* Review Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết đánh giá</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <ReviewDetails
              review={selectedReview}
              onClose={handleCloseDetails}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
