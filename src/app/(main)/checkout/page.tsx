import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CheckoutHeader from "./_components/checkout-header";
import CheckoutForm from "./_components/checkout-form";
import CheckoutSummary from "./_components/checkout-summary";
import { CheckoutProvider } from "./_components/checkout-context";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thanh toán",
  description:
    "Hoàn tất đơn hàng của bạn tại Minishop. Nhập thông tin giao hàng, chọn phương thức thanh toán và xác nhận đơn hàng một cách an toàn.",
  keywords: "thanh toán, đặt hàng, giao hàng, phương thức thanh toán",
  openGraph: {
    title: "Thanh toán | Minishop",
    description: "Hoàn tất đơn hàng của bạn một cách an toàn",
    url: "/checkout",
    images: [
      {
        url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=630&fit=crop",
        width: 1200,
        height: 630,
        alt: "Thanh toán Minishop",
      },
    ],
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CheckoutPage() {
  const supabase = createClient();

  // Check authentication
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/login?returnUrl=/checkout");
  }

  return (
    <CheckoutProvider>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <CheckoutHeader />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <CheckoutForm />
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <CheckoutSummary />
            </div>
          </div>
        </div>
      </div>
    </CheckoutProvider>
  );
}
