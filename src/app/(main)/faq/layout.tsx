import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Câu hỏi thường gặp",
  description:
    "Tìm câu trả lời cho các câu hỏi thường gặp về mua sắm, thanh toán, giao hàng và chính sách đổi trả tại Minishop.",
  keywords: "FAQ, câu hỏi thường gặp, hỗ trợ, thanh toán, giao hàng, đổi trả",
  openGraph: {
    title: "Câu hỏi thường gặp | Minishop",
    description: "Tìm câu trả lời cho các câu hỏi thường gặp tại Minishop",
    url: "/faq",
    images: [
      {
        url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=630&fit=crop",
        width: 1200,
        height: 630,
        alt: "FAQ Minishop",
      },
    ],
  },
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return children;
}
