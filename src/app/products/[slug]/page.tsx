import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductDetails from "./_components/product-details";
import ProductImages from "./_components/product-images";
import ProductReviews from "./_components/product-reviews";
import RelatedProducts from "./_components/related-products";
import { Separator } from "@/components/ui/separator";
import { getProductBySlug } from "@/actions/products/get-product-by-slug";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const result = await getProductBySlug({ slug: params.slug });

  if (!result.success) {
    return {
      title: "Sản phẩm không tìm thấy - Mini Shop",
    };
  }

  const { product } = result;

  return {
    title: `${product.name} - Mini Shop`,
    description:
      product.description ||
      `Mua ${product.name} với giá tốt nhất tại Mini Shop`,
    openGraph: {
      title: product.name,
      description: product.description || undefined,
      images: product.images?.length ? [product.images[0]] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const result = await getProductBySlug({ slug: params.slug });

  if (!result.success) {
    notFound();
  }

  const { product } = result;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Product Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <ProductImages
            images={product.images || []}
            productName={product.name}
          />

          {/* Product Details */}
          <ProductDetails product={product} />
        </div>

        <Separator className="my-12" />

        {/* Product Description and Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Description */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Mô tả sản phẩm</h2>
            {product.description ? (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground italic">
                Chưa có mô tả cho sản phẩm này.
              </p>
            )}

            {/* Product Specifications - TODO: Implement when specifications field is available */}
          </div>

          {/* Product Reviews Summary */}
          <div className="lg:col-span-1">
            <ProductReviews averageRating={0} reviewCount={0} />
          </div>
        </div>

        <Separator className="my-12" />

        {/* Related Products */}
        <RelatedProducts
          productId={product.id}
          categoryId={product.category_id || undefined}
        />
      </div>
    </div>
  );
}
