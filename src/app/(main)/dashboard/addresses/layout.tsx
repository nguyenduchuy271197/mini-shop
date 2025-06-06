import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý địa chỉ | Mini Shop",
  description: "Quản lý địa chỉ giao hàng và thanh toán của bạn",
};

export default function AddressesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
