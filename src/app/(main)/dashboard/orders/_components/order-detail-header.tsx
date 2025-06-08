import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderDetailHeaderProps {
  orderId: number;
}

export default function OrderDetailHeader({ orderId }: OrderDetailHeaderProps) {
  return (
    <div className="space-y-4 mb-8">
      {/* Back to Orders */}
      <div className="flex items-center">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/orders" className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            Quay lại danh sách đơn hàng
          </Link>
        </Button>
      </div>

      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Chi tiết đơn hàng #{orderId}
        </h1>
        <p className="text-gray-600 mt-2">
          Thông tin chi tiết và trạng thái đơn hàng
        </p>
      </div>
    </div>
  );
}
