import Link from "next/link";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CartEmpty() {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <ShoppingCart className="h-10 w-10 text-gray-400" />
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Giỏ hàng của bạn đang trống
      </h3>

      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Hãy khám phá các sản phẩm tuyệt vời của chúng tôi và thêm chúng vào giỏ
        hàng
      </p>

      <div className="space-y-4">
        <Button asChild size="lg">
          <Link href="/products" className="inline-flex items-center">
            Khám phá sản phẩm
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>

        <div className="text-sm text-gray-500">
          hoặc{" "}
          <Link href="/" className="text-primary hover:underline">
            quay về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
