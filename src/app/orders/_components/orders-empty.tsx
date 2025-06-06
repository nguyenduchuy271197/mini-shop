import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ShoppingBag } from "lucide-react";

export default function OrdersEmpty() {
  return (
    <Card>
      <CardContent className="text-center py-12">
        <Package className="h-16 w-16 text-gray-400 mx-auto mb-6" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          Bạn chưa có đơn hàng nào
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Hãy khám phá các sản phẩm tuyệt vời của chúng tôi và đặt hàng ngay hôm
          nay!
        </p>
        <Button asChild size="lg">
          <Link href="/products" className="inline-flex items-center">
            <ShoppingBag className="w-5 h-5 mr-2" />
            Mua sắm ngay
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
