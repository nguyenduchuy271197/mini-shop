import { MessageSquare, CheckCircle, Star, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ReviewStats } from "@/hooks/admin/reviews";
import { getReviewSummaryText } from "../_lib/utils";

interface ReviewsStatsProps {
  stats: ReviewStats;
}

export default function ReviewsStats({ stats }: ReviewsStatsProps) {
  const summaryTexts = getReviewSummaryText(stats);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <div className="ml-2">
              <p className="text-sm font-medium leading-none">
                {summaryTexts.totalText}
              </p>
              <p className="text-sm text-muted-foreground">Tổng số đánh giá</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <div className="ml-2">
              <p className="text-sm font-medium leading-none">
                {summaryTexts.approvalRate}
              </p>
              <p className="text-sm text-muted-foreground">Tỷ lệ duyệt</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <Filter className="h-4 w-4 text-blue-600" />
            <div className="ml-2">
              <p className="text-sm font-medium leading-none">
                {summaryTexts.verificationRate}
              </p>
              <p className="text-sm text-muted-foreground">Đã xác minh</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-600" />
            <div className="ml-2">
              <p className="text-sm font-medium leading-none">
                {summaryTexts.averageRatingText}
              </p>
              <p className="text-sm text-muted-foreground">
                Đánh giá trung bình
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
