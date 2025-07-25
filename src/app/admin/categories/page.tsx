import { Suspense } from "react";
import { AdminPageWrapper } from "@/components/admin/admin-page-wrapper";
import { AdminCategoriesHeader } from "./_components/admin-categories-header";
import { AdminCategoriesTable } from "./_components/admin-categories-table";
import { AdminCategoriesStats } from "./_components/admin-categories-stats";

export default function AdminCategoriesPage() {
  return (
    <AdminPageWrapper>
      {/* Page Header */}
      <AdminCategoriesHeader />

      {/* Statistics */}
      <Suspense
        fallback={<div className="h-24 bg-gray-100 rounded-lg animate-pulse" />}
      >
        <AdminCategoriesStats />
      </Suspense>

      {/* Main Content */}
      <div className="">
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
    </AdminPageWrapper>
  );
}
