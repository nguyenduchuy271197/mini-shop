import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, MessageSquare } from "lucide-react";

interface ProductReviewsProps {
  averageRating?: number;
  reviewCount?: number;
}

export default function ProductReviews({
  averageRating,
  reviewCount,
}: ProductReviewsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Đánh giá sản phẩm
        </CardTitle>
      </CardHeader>
      <CardContent>
        {averageRating && averageRating > 0 ? (
          <div className="space-y-4">
            {/* Overall Rating */}
            <div className="text-center py-6 border rounded-lg">
              <div className="text-4xl font-bold text-primary mb-2">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex items-center justify-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {reviewCount || 0} đánh giá
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Phân bố đánh giá</h4>
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-2 text-sm">
                  <span className="w-4">{rating}</span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: "0%" }}
                    />
                  </div>
                  <span className="w-8 text-xs text-muted-foreground">0</span>
                </div>
              ))}
            </div>

            {/* Reviews List Placeholder */}
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                Tính năng hiển thị chi tiết đánh giá sẽ được cập nhật sớm
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Chưa có đánh giá nào cho sản phẩm này</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
