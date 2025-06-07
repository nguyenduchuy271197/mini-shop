"use client";

import { useState } from "react";
import { Search, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  useAdminReviews,
  useApproveReview,
  useRejectReview,
  useBulkModerateReviews,
} from "@/hooks/admin/reviews";
import type { ReviewWithDetails, ReviewFilters } from "@/hooks/admin/reviews";
import {
  reviewStatusOptions,
  reviewRatingOptions,
  reviewVerificationOptions,
  validateBulkAction,
  getReviewActionConfirmation,
} from "../_lib/utils";
import ReviewsTable from "./reviews-table";
import ReviewsStats from "./reviews-stats";

interface ReviewsListProps {
  onViewDetails?: (review: ReviewWithDetails) => void;
}

export default function ReviewsList({ onViewDetails }: ReviewsListProps) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [filters, setFilters] = useState<ReviewFilters>({});
  const [page, setPage] = useState(1);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: "approve" | "reject";
    ids: number[];
  } | null>(null);

  const limit = 20;

  // Queries
  const { data: reviewsData, isLoading } = useAdminReviews({
    pagination: { page, limit },
    filters: {
      ...filters,
      search: search || undefined,
    },
  });

  // Mutations
  const { mutate: approveReview, isPending: isApproving } = useApproveReview({
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã duyệt đánh giá",
      });
      setSelectedIds([]);
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
      setSelectedIds([]);
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

  const { mutate: bulkModerate, isPending: isBulkModerating } =
    useBulkModerateReviews({
      onSuccess: (data) => {
        const { successful, failed } = data.results;
        toast({
          title: "Thành công",
          description: `Đã xử lý: ${successful} thành công, ${failed} thất bại`,
        });
        setSelectedIds([]);
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

  const reviews = reviewsData?.reviews || [];
  const pagination = reviewsData?.pagination;
  const stats = reviewsData?.stats;

  const handleSingleAction = (
    reviewId: number,
    action: "approve" | "reject"
  ) => {
    const validation = validateBulkAction([reviewId], action);
    if (validation) {
      toast({
        title: "Lỗi",
        description: validation,
        variant: "destructive",
      });
      return;
    }

    setPendingAction({ type: action, ids: [reviewId] });
    setShowConfirmDialog(true);
  };

  const handleBulkAction = (action: "approve" | "reject") => {
    const validation = validateBulkAction(selectedIds, action);
    if (validation) {
      toast({
        title: "Lỗi",
        description: validation,
        variant: "destructive",
      });
      return;
    }

    setPendingAction({ type: action, ids: selectedIds });
    setShowConfirmDialog(true);
  };

  const executeAction = () => {
    if (!pendingAction) return;

    const { type, ids } = pendingAction;

    if (ids.length === 1) {
      // Single action
      if (type === "approve") {
        approveReview({ reviewId: ids[0] });
      } else {
        rejectReview({ reviewId: ids[0] });
      }
    } else {
      // Bulk action
      const action = type === "approve" ? "approve" : "reject";
      bulkModerate({ reviewIds: ids, action });
    }

    setShowConfirmDialog(false);
    setPendingAction(null);
  };

  const isPending = isApproving || isRejecting || isBulkModerating;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Đang tải...</div>
        </CardContent>
      </Card>
    );
  }

  const confirmDialog = pendingAction
    ? getReviewActionConfirmation(pendingAction.type, pendingAction.ids.length)
    : null;

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && <ReviewsStats stats={stats} />}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách đánh giá</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm theo tên khách hàng, sản phẩm, nội dung..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <Select
                value={
                  filters.is_approved === undefined
                    ? "all"
                    : filters.is_approved
                    ? "approved"
                    : "pending"
                }
                onValueChange={(value) => {
                  if (value === "all") {
                    setFilters((prev) => ({ ...prev, is_approved: undefined }));
                  } else {
                    setFilters((prev) => ({
                      ...prev,
                      is_approved: value === "approved",
                    }));
                  }
                }}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {reviewStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.rating?.toString() || "all"}
                onValueChange={(value) => {
                  if (value === "all") {
                    setFilters((prev) => ({ ...prev, rating: undefined }));
                  } else {
                    setFilters((prev) => ({
                      ...prev,
                      rating: parseInt(value),
                    }));
                  }
                }}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Đánh giá" />
                </SelectTrigger>
                <SelectContent>
                  {reviewRatingOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={
                  filters.is_verified === undefined
                    ? "all"
                    : filters.is_verified
                    ? "verified"
                    : "unverified"
                }
                onValueChange={(value) => {
                  if (value === "all") {
                    setFilters((prev) => ({ ...prev, is_verified: undefined }));
                  } else {
                    setFilters((prev) => ({
                      ...prev,
                      is_verified: value === "verified",
                    }));
                  }
                }}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Xác minh" />
                </SelectTrigger>
                <SelectContent>
                  {reviewVerificationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">
                Đã chọn {selectedIds.length} đánh giá
              </span>
              <Button
                size="sm"
                onClick={() => handleBulkAction("approve")}
                disabled={isPending}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Duyệt
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleBulkAction("reject")}
                disabled={isPending}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Từ chối
              </Button>
            </div>
          )}

          {/* Reviews Table */}
          <ReviewsTable
            reviews={reviews}
            selectedIds={selectedIds}
            onSelectAll={(checked) => {
              if (checked) {
                setSelectedIds(reviews.map((review) => review.id));
              } else {
                setSelectedIds([]);
              }
            }}
            onSelectReview={(reviewId, checked) => {
              if (checked) {
                setSelectedIds((prev) => [...prev, reviewId]);
              } else {
                setSelectedIds((prev) => prev.filter((id) => id !== reviewId));
              }
            }}
            onSingleAction={handleSingleAction}
            onViewDetails={onViewDetails}
            isPending={isPending}
          />

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                Hiển thị {(pagination.page - 1) * pagination.limit + 1} đến{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                trong tổng số {pagination.total} đánh giá
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pagination.totalPages}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={executeAction}>
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
