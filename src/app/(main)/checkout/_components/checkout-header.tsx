import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutHeader() {
  return (
    <div className="space-y-4">
      {/* Back to Cart */}
      <div className="flex items-center">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/cart" className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            Quay lại giỏ hàng
          </Link>
        </Button>
      </div>

      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Thanh toán</h1>
        <p className="text-gray-600 mt-2">Hoàn tất thông tin để đặt hàng</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm">
            ✓
          </div>
          <span className="ml-2 text-sm text-green-600">Giỏ hàng</span>
        </div>

        <div className="w-8 h-0.5 bg-gray-300"></div>

        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm">
            2
          </div>
          <span className="ml-2 text-sm text-primary font-medium">
            Thanh toán
          </span>
        </div>

        <div className="w-8 h-0.5 bg-gray-300"></div>

        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm">
            3
          </div>
          <span className="ml-2 text-sm text-gray-600">Hoàn thành</span>
        </div>
      </div>
    </div>
  );
}
