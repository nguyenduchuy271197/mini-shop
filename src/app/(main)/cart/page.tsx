import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CartHeader from "./_components/cart-header";
import CartItems from "./_components/cart-items";
import CartSummary from "./_components/cart-summary";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giỏ hàng",
  description:
    "Xem lại các sản phẩm trong giỏ hàng của bạn tại Minishop. Cập nhật số lượng, xóa sản phẩm hoặc tiến hành thanh toán một cách dễ dàng.",
  keywords: "giỏ hàng, thanh toán, mua sắm, sản phẩm đã chọn",
  openGraph: {
    title: "Giỏ hàng | Minishop",
    description: "Xem lại các sản phẩm trong giỏ hàng của bạn",
    url: "/cart",
    images: [
      {
        url: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&h=630&fit=crop",
        width: 1200,
        height: 630,
        alt: "Giỏ hàng Minishop",
      },
    ],
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default async function CartPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CartHeader />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <CartItems />
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <CartSummary />
        </div>
      </div>
    </div>
  );
}
