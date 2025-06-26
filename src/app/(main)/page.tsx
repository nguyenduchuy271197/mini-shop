import HeroSection from "./_components/hero-section";
import FeaturedProducts from "./_components/featured-products";
import CategoriesSection from "./_components/categories-section";
import BenefitsSection from "./_components/benefits-section";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trang chủ",
  description:
    "Khám phá hàng ngàn sản phẩm chất lượng cao với giá tốt nhất tại Minishop. Điện tử, thời trang, gia dụng, sách và nhiều hơn nữa. Miễn phí giao hàng cho đơn từ 300k.",
  keywords:
    "trang chủ minishop, sản phẩm hot, giảm giá, điện tử, thời trang, gia dụng, miễn phí giao hàng",
  openGraph: {
    title: "Trang chủ | Minishop",
    description:
      "Khám phá hàng ngàn sản phẩm chất lượng cao với giá tốt nhất tại Minishop",
    url: "/",
    images: [
      {
        url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=630&fit=crop",
        width: 1200,
        height: 630,
        alt: "Minishop - Mua sắm trực tuyến",
      },
    ],
  },
};

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <FeaturedProducts />
      </section>

      {/* Categories */}
      <section className="py-16">
        <CategoriesSection />
      </section>

      {/* Benefits */}
      <section className="py-16 bg-gray-50">
        <BenefitsSection />
      </section>
    </>
  );
}
