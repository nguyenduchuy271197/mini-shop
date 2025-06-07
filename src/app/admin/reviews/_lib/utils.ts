export const reviewStatusOptions = [
  { value: "all", label: "Tất cả" },
  { value: "approved", label: "Đã duyệt" },
  { value: "pending", label: "Chờ duyệt" },
] as const;

export const reviewRatingOptions = [
  { value: "all", label: "Tất cả" },
  { value: "5", label: "5 sao" },
  { value: "4", label: "4 sao" },
  { value: "3", label: "3 sao" },
  { value: "2", label: "2 sao" },
  { value: "1", label: "1 sao" },
] as const;

export const reviewVerificationOptions = [
  { value: "all", label: "Tất cả" },
  { value: "verified", label: "Đã xác minh" },
  { value: "unverified", label: "Chưa xác minh" },
] as const;

export function getReviewStatusText(review: { is_approved: boolean }) {
  return review.is_approved
    ? { text: "Đã duyệt", variant: "default" as const }
    : { text: "Chờ duyệt", variant: "secondary" as const };
}

export function getVerificationStatusText(review: { is_verified: boolean }) {
  return review.is_verified
    ? { text: "Đã xác minh", variant: "default" as const }
    : { text: "Chưa xác minh", variant: "outline" as const };
}

export function formatRating(rating: number): string {
  return `${rating}/5`;
}

export function getRatingStars(rating: number): string {
  const fullStars = "★".repeat(rating);
  const emptyStars = "☆".repeat(5 - rating);
  return fullStars + emptyStars;
}

export function getRatingColor(rating: number): string {
  if (rating >= 4) return "text-green-600";
  if (rating >= 3) return "text-yellow-600";
  if (rating >= 2) return "text-orange-600";
  return "text-red-600";
}

export function formatHelpfulCount(count: number): string {
  return `${count} người thấy hữu ích`;
}

export function truncateComment(comment: string | null, maxLength: number = 100): string {
  if (!comment) return "";
  if (comment.length <= maxLength) return comment;
  return comment.substring(0, maxLength) + "...";
}

export function validateBulkAction(selectedIds: number[], action: string): string | null {
  if (selectedIds.length === 0) {
    return "Vui lòng chọn ít nhất một đánh giá";
  }

  if (action === "approve" && selectedIds.length > 50) {
    return "Chỉ có thể duyệt tối đa 50 đánh giá cùng lúc";
  }

  if (action === "reject" && selectedIds.length > 50) {
    return "Chỉ có thể từ chối tối đa 50 đánh giá cùng lúc";
  }

  return null;
}

export function getReviewSummaryText(stats: {
  total: number;
  approved: number;
  pending: number;
  verified: number;
  averageRating: number;
}): {
  totalText: string;
  approvalRate: string;
  verificationRate: string;
  averageRatingText: string;
} {
  const approvalRate = stats.total > 0 
    ? Math.round((stats.approved / stats.total) * 100)
    : 0;
  
  const verificationRate = stats.total > 0 
    ? Math.round((stats.verified / stats.total) * 100)
    : 0;

  return {
    totalText: `${stats.total} đánh giá`,
    approvalRate: `${approvalRate}% đã duyệt`,
    verificationRate: `${verificationRate}% đã xác minh`,
    averageRatingText: `${stats.averageRating.toFixed(1)}/5.0`,
  };
}

export function getReviewActionConfirmation(action: "approve" | "reject", count: number): {
  title: string;
  description: string;
} {
  if (action === "approve") {
    return {
      title: `Duyệt ${count} đánh giá`,
      description: count === 1 
        ? "Đánh giá này sẽ được hiển thị công khai. Bạn có chắc chắn?"
        : `${count} đánh giá sẽ được hiển thị công khai. Bạn có chắc chắn?`,
    };
  } else {
    return {
      title: `Từ chối ${count} đánh giá`,
      description: count === 1
        ? "Đánh giá này sẽ bị ẩn và không hiển thị công khai. Bạn có chắc chắn?"
        : `${count} đánh giá sẽ bị ẩn và không hiển thị công khai. Bạn có chắc chắn?`,
    };
  }
} 