import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WishlistEmpty() {
  return (
    <div className="text-center py-16">
      <div className="mx-auto w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
        <Heart className="h-12 w-12 text-red-400" />
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Danh sách yêu thích của bạn đang trống
      </h3>

      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Hãy khám phá các sản phẩm tuyệt vời và thêm chúng vào danh sách yêu
        thích để theo dõi
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
          <Link href="/dashboard" className="text-primary hover:underline">
            quay về dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
