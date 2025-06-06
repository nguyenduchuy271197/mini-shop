"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useUpdateReview } from "@/hooks/reviews";
import { ReviewWithProduct } from "@/hooks/reviews/use-user-reviews";

interface EditReviewDialogProps {
  review: ReviewWithProduct;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditReviewDialog({
  review,
  open,
  onOpenChange,
}: EditReviewDialogProps) {
  const [rating, setRating] = useState(review.rating);
  const [title, setTitle] = useState(review.title || "");
  const [comment, setComment] = useState(review.comment || "");
  const [hoveredRating, setHoveredRating] = useState(0);
  const { toast } = useToast();

  const updateReview = useUpdateReview({
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã cập nhật đánh giá thành công",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: error,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (comment.trim().length < 10) {
      toast({
        title: "Lỗi",
        description: "Nhận xét phải có ít nhất 10 ký tự",
        variant: "destructive",
      });
      return;
    }

    updateReview.mutate({
      reviewId: review.id,
      rating,
      title: title.trim() || undefined,
      comment: comment.trim(),
    });
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => {
      const starValue = i + 1;
      const isActive = starValue <= (hoveredRating || rating);

      return (
        <button
          key={i}
          type="button"
          className="focus:outline-none"
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
          onClick={() => setRating(starValue)}
        >
          <Star
            className={`h-6 w-6 transition-colors ${
              isActive
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 hover:text-yellow-400"
            }`}
          />
        </button>
      );
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa đánh giá</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900">
              {review.products?.name || "Sản phẩm"}
            </h4>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label>Đánh giá *</Label>
            <div className="flex items-center gap-1">
              {renderStars()}
              <span className="ml-2 text-sm text-gray-600">{rating}/5 sao</span>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề (tùy chọn)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tóm tắt đánh giá của bạn"
              maxLength={200}
            />
            <p className="text-xs text-gray-500">{title.length}/200 ký tự</p>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Nhận xét *</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
              rows={4}
              maxLength={1000}
              required
            />
            <p className="text-xs text-gray-500">
              {comment.length}/1000 ký tự (tối thiểu 10 ký tự)
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateReview.isPending}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={updateReview.isPending || comment.trim().length < 10}
            >
              {updateReview.isPending ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
