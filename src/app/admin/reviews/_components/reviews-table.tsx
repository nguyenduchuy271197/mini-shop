import { CheckCircle, XCircle, Eye, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ReviewWithDetails } from "@/hooks/admin/reviews";
import {
  getReviewStatusText,
  getVerificationStatusText,
  getRatingStars,
  getRatingColor,
  formatHelpfulCount,
  truncateComment,
} from "../_lib/utils";

interface ReviewsTableProps {
  reviews: ReviewWithDetails[];
  selectedIds: number[];
  onSelectAll: (checked: boolean) => void;
  onSelectReview: (reviewId: number, checked: boolean) => void;
  onSingleAction: (reviewId: number, action: "approve" | "reject") => void;
  onViewDetails?: (review: ReviewWithDetails) => void;
  isPending: boolean;
}

export default function ReviewsTable({
  reviews,
  selectedIds,
  onSelectAll,
  onSelectReview,
  onSingleAction,
  onViewDetails,
  isPending,
}: ReviewsTableProps) {
  const isAllSelected =
    reviews.length > 0 && selectedIds.length === reviews.length;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox checked={isAllSelected} onCheckedChange={onSelectAll} />
            </TableHead>
            <TableHead>Khách hàng</TableHead>
            <TableHead>Sản phẩm</TableHead>
            <TableHead>Đánh giá</TableHead>
            <TableHead>Nội dung</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Hữu ích</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.map((review) => {
            const statusInfo = getReviewStatusText(review);
            const verificationInfo = getVerificationStatusText(review);
            const isSelected = selectedIds.includes(review.id);

            return (
              <TableRow key={review.id}>
                <TableCell>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      onSelectReview(review.id, checked as boolean)
                    }
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {review.user?.full_name || "N/A"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {review.user?.email || ""}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {review.product?.name || "N/A"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {review.product?.sku || ""}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-lg ${getRatingColor(review.rating)}`}
                    >
                      {getRatingStars(review.rating)}
                    </span>
                    <span className="text-sm font-medium">
                      ({review.rating}/5)
                    </span>
                  </div>
                  <Badge variant={verificationInfo.variant} className="mt-1">
                    {verificationInfo.text}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div>
                    {review.title && (
                      <div className="font-medium text-sm mb-1">
                        {review.title}
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground">
                      {truncateComment(review.comment, 80)}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={statusInfo.variant}>{statusInfo.text}</Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {formatHelpfulCount(review.helpful_count)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {onViewDetails && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onViewDetails(review)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {!review.is_approved && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onSingleAction(review.id, "approve")}
                        disabled={isPending}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    {review.is_approved && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onSingleAction(review.id, "reject")}
                        disabled={isPending}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {reviews.length === 0 && (
        <div className="text-center py-12">
          <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Chưa có đánh giá nào</h3>
          <p className="text-muted-foreground">
            Đánh giá sẽ xuất hiện ở đây khi khách hàng gửi đánh giá
          </p>
        </div>
      )}
    </div>
  );
}
