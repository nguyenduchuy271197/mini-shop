import { Suspense } from "react";
import CategoriesGrid from "./_components/categories-grid";
import { Skeleton } from "@/components/ui/skeleton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Danh mục sản phẩm",
  description:
    "Khám phá các danh mục sản phẩm đa dạng tại Minishop. Điện tử, thời trang, gia dụng, sách, thể thao và nhiều danh mục khác. Tìm kiếm sản phẩm theo danh mục một cách dễ dàng.",
  keywords:
    "danh mục, điện tử, thời trang, gia dụng, sách, thể thao, phân loại sản phẩm",
  openGraph: {
    title: "Danh mục sản phẩm | Minishop",
    description: "Khám phá các danh mục sản phẩm đa dạng tại Minishop",
    url: "/categories",
    images: [
      {
        url: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&h=630&fit=crop",
        width: 1200,
        height: 630,
        alt: "Danh mục sản phẩm Minishop",
      },
    ],
  },
};

export default function CategoriesPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Danh mục sản phẩm
          </h1>
          <p className="text-gray-600 mt-2">
            Khám phá các danh mục sản phẩm của chúng tôi
          </p>
        </div>

        {/* Categories Grid */}
        <Suspense fallback={<CategoriesGridLoading />}>
          <CategoriesGrid />
        </Suspense>
      </div>
    </div>
  );
}

// Loading component
function CategoriesGridLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="p-6 border rounded-lg space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      ))}
    </div>
  );
}
