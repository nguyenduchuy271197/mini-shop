import { Suspense } from "react";
import { AdminCategoriesHeader } from "./_components/admin-categories-header";
import { AdminCategoriesTable } from "./_components/admin-categories-table";
import { AdminCategoriesTree } from "./_components/admin-categories-tree";
import { AdminCategoriesStats } from "./_components/admin-categories-stats";

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <AdminCategoriesHeader />

      {/* Statistics */}
      <Suspense
        fallback={<div className="h-24 bg-gray-100 rounded-lg animate-pulse" />}
      >
        <AdminCategoriesStats />
      </Suspense>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories Tree */}
        <div className="lg:col-span-1">
          <Suspense
            fallback={
              <div className="h-96 bg-gray-100 rounded-lg animate-pulse" />
            }
          >
            <AdminCategoriesTree />
          </Suspense>
        </div>

        {/* Categories Table */}
        <div className="lg:col-span-2">
          <Suspense
            fallback={
              <div className="h-96 bg-gray-100 rounded-lg animate-pulse" />
            }
          >
            <AdminCategoriesTable />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
