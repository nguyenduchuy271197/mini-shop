import { Suspense } from "react";
import CategoriesGrid from "./_components/categories-grid";
import { Skeleton } from "@/components/ui/skeleton";

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
