import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Mini Shop - Cửa hàng trực tuyến",
  description: "Cửa hàng thương mại điện tử với nhiều sản phẩm chất lượng",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
