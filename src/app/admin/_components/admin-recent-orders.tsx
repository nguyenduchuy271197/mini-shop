import Link from "next/link";
import { Eye } from "lucide-react";
import type { Order } from "@/types/custom.types";

interface AdminRecentOrdersProps {
  orders: (Order & {
    order_items: Array<{
      id: number;
      product_name: string;
      quantity: number;
      products: { name: string } | null;
    }>;
  })[];
}

export function AdminRecentOrders({ orders }: AdminRecentOrdersProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-purple-100 text-purple-800";
      case "shipped":
        return "bg-indigo-100 text-indigo-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Chờ xử lý";
      case "confirmed":
        return "Đã xác nhận";
      case "processing":
        return "Đang xử lý";
      case "shipped":
        return "Đã gửi hàng";
      case "delivered":
        return "Đã giao hàng";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Đơn hàng gần đây
          </h3>
          <Link
            href="/admin/orders"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Xem tất cả
          </Link>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {orders.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            Chưa có đơn hàng nào
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <p className="text-sm font-medium text-gray-900">
                      #{order.order_number}
                    </p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {order.order_items.length} sản phẩm •{" "}
                    {order.total_amount.toLocaleString()} ₫
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(order.created_at).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <Eye className="h-4 w-4 text-gray-500" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
