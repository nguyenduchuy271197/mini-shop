"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminPageWrapper } from "@/components/admin/admin-page-wrapper";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
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
    <AdminPageWrapper>
      <AdminPageHeader
        title="Quản Lý Đánh Giá"
        description="Duyệt, xóa đánh giá không phù hợp"
      />

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
    </AdminPageWrapper>
  );
}
