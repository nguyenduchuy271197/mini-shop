import Link from "next/link";
import { TrendingUp } from "lucide-react";

// Mock data - sẽ được thay thế bằng data thực từ database
const mockTopProducts = [
  {
    id: 1,
    name: "iPhone 15 Pro Max",
    sales: 156,
    revenue: 234000000,
    image: "/placeholder-product.jpg",
  },
  {
    id: 2,
    name: "Samsung Galaxy S24 Ultra",
    sales: 134,
    revenue: 201000000,
    image: "/placeholder-product.jpg",
  },
  {
    id: 3,
    name: "MacBook Air M3",
    sales: 89,
    revenue: 267000000,
    image: "/placeholder-product.jpg",
  },
  {
    id: 4,
    name: "iPad Pro 12.9",
    sales: 76,
    revenue: 152000000,
    image: "/placeholder-product.jpg",
  },
  {
    id: 5,
    name: "AirPods Pro 2",
    sales: 203,
    revenue: 101500000,
    image: "/placeholder-product.jpg",
  },
];

export function AdminTopProducts() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Sản phẩm bán chạy
          </h3>
          <Link
            href="/admin/reports/products"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Xem báo cáo
          </Link>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {mockTopProducts.map((product, index) => (
          <div key={product.id} className="px-6 py-4 hover:bg-gray-50">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    #{index + 1}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {product.name}
                </p>
                <div className="flex items-center space-x-4 mt-1">
                  <p className="text-sm text-gray-500">
                    {product.sales} đã bán
                  </p>
                  <p className="text-sm text-gray-500">
                    {product.revenue.toLocaleString()} ₫
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
        <p className="text-xs text-gray-500 text-center">
          Dữ liệu trong 30 ngày qua
        </p>
      </div>
    </div>
  );
}
