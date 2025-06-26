import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Minishop",
    default: "Minishop - Siêu thị trực tuyến hàng đầu Việt Nam",
  },
  description:
    "Minishop - Siêu thị trực tuyến hàng đầu Việt Nam. Mua sắm điện tử, thời trang, gia dụng, sách với giá tốt nhất. Giao hàng nhanh, thanh toán an toàn.",
  keywords:
    "minishop, mua sắm online, siêu thị trực tuyến, điện tử, thời trang, gia dụng, sách, giá rẻ, giao hàng nhanh",
  authors: [{ name: "Minishop Team" }],
  creator: "Minishop",
  publisher: "Minishop",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://minishop.vn"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "/",
    siteName: "Minishop",
    title: "Minishop - Siêu thị trực tuyến hàng đầu Việt Nam",
    description:
      "Mua sắm điện tử, thời trang, gia dụng, sách với giá tốt nhất. Giao hàng nhanh, thanh toán an toàn.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=630&fit=crop",
        width: 1200,
        height: 630,
        alt: "Minishop - Siêu thị trực tuyến",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Minishop - Siêu thị trực tuyến hàng đầu Việt Nam",
    description:
      "Mua sắm điện tử, thời trang, gia dụng, sách với giá tốt nhất.",
    images: [
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=630&fit=crop",
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code",
    yandex: "yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
