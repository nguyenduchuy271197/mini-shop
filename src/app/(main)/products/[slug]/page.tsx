import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductDetails from "./_components/product-details";
import ProductImages from "./_components/product-images";
import RelatedProducts from "./_components/related-products";
import { Separator } from "@/components/ui/separator";
import { getProductBySlug } from "@/actions/products/get-product-by-slug";
import { ProductReviews, CreateReviewDialog } from "@/components/reviews";

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
      title: "Sản phẩm không tìm thấy",
      description: "Sản phẩm bạn tìm kiếm không tồn tại hoặc đã được gỡ bỏ",
    };
  }

  const { product } = result;
  const price = product.price?.toLocaleString("vi-VN") + "đ";

  return {
    title: product.name,
    description:
      product.description ||
      `Mua ${product.name} chính hãng với giá ${price} tại Minishop. Giao hàng nhanh, bảo hành chính hãng, đổi trả dễ dàng.`,
    keywords: `${product.name}, ${product.category?.name}, mua ${product.name}, giá ${product.name}`,
    openGraph: {
      title: `${product.name} | Minishop`,
      description:
        product.description ||
        `Mua ${product.name} chính hãng với giá ${price}`,
      url: `/products/${params.slug}`,
      type: "website",
      images: product.images?.length
        ? [
            {
              url: product.images[0],
              width: 800,
              height: 600,
              alt: product.name,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | Minishop`,
      description:
        product.description ||
        `Mua ${product.name} chính hãng với giá ${price}`,
      images: product.images?.length ? [product.images[0]] : [],
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

        {/* Product Description */}
        <div className="mb-12">
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

        <Separator className="my-12" />

        {/* Product Reviews Section */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h2 className="text-2xl font-bold">Đánh giá sản phẩm</h2>
            <CreateReviewDialog
              productId={product.id}
              productName={product.name}
            />
          </div>

          <ProductReviews productId={product.id} showCreateButton={true} />
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
