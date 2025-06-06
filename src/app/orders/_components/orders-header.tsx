import { Package } from "lucide-react";

export default function OrdersHeader() {
  return (
    <div className="space-y-4 mb-8">
      {/* Page Title */}
      <div className="flex items-center space-x-3">
        <Package className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Đơn hàng của tôi</h1>
          <p className="text-gray-600 mt-1">
            Xem lịch sử đơn hàng và theo dõi trạng thái giao hàng
          </p>
        </div>
      </div>
    </div>
  );
}
