import Link from "next/link";
import { ChevronRight, ShoppingCart } from "lucide-react";

export default function CartHeader() {
  return (
    <div className="border-b pb-6">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-foreground transition-colors">
          Trang chủ
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-foreground">Giỏ hàng</span>
      </nav>

      {/* Page Title */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <ShoppingCart className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Giỏ hàng của bạn</h1>
          <p className="text-muted-foreground">
            Xem lại các sản phẩm trước khi đặt hàng
          </p>
        </div>
      </div>
    </div>
  );
}
