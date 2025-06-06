import { Suspense } from "react";
import CategoriesGrid from "./_components/categories-grid";
import CategoriesTree from "./_components/categories-tree";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

        {/* Categories Display */}
        <Tabs defaultValue="grid" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="grid">Hiển thị lưới</TabsTrigger>
            <TabsTrigger value="tree">Hiển thị cây</TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="mt-6">
            <Suspense fallback={<CategoriesGridLoading />}>
              <CategoriesGrid />
            </Suspense>
          </TabsContent>

          <TabsContent value="tree" className="mt-6">
            <Suspense fallback={<CategoriesTreeLoading />}>
              <CategoriesTree />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Loading components
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

function CategoriesTreeLoading() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="p-4 border rounded-lg">
          <Skeleton className="h-6 w-1/3 mb-3" />
          <div className="ml-6 space-y-2">
            {Array.from({ length: 3 }).map((_, j) => (
              <Skeleton key={j} className="h-4 w-1/4" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
