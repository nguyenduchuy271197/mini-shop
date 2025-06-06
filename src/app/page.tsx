import HeroSection from "./_components/hero-section";
import FeaturedProducts from "./_components/featured-products";
import CategoriesSection from "./_components/categories-section";
import BenefitsSection from "./_components/benefits-section";

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
