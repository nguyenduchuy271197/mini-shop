import { MessageSquare, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export function ReviewsEmpty() {
  return (
    <Card>
      <CardContent className="p-12">
        <div className="text-center space-y-6">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
            <MessageSquare className="h-12 w-12 text-gray-400" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">
              Chưa có đánh giá nào
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Bạn chưa đánh giá sản phẩm nào. Hãy mua sắm và chia sẻ trải nghiệm
              của bạn với cộng đồng!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/products">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Khám phá sản phẩm
              </Link>
            </Button>

            <Button variant="outline" asChild>
              <Link href="/dashboard/orders">Xem đơn hàng</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
