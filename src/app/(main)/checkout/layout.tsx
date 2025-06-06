import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thanh toán - Mini Shop",
  description: "Hoàn tất đơn hàng và thanh toán an toàn",
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
