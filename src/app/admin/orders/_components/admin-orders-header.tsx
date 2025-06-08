import { ShoppingCart, Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function AdminOrdersHeader() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <ShoppingCart className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
          <p className="text-gray-600 mt-1">
            Xem và cập nhật trạng thái đơn hàng
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <RotateCcw className="h-4 w-4 mr-2" />
          Làm mới
        </Button>

        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Xuất báo cáo
        </Button>
      </div>
    </div>
  );
}
