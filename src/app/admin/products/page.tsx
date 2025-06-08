import { Suspense } from "react";
import { AdminPageWrapper } from "@/components/admin/admin-page-wrapper";
import { AdminProductsHeader } from "./_components/admin-products-header";
import { AdminProductsStats } from "./_components/admin-products-stats";
import { AdminProductsContent } from "./_components/admin-products-content";

export default function AdminProductsPage() {
  return (
    <AdminPageWrapper>
      {/* Page Header */}
      <AdminProductsHeader />

      {/* Statistics */}
      <Suspense
        fallback={<div className="h-24 bg-gray-100 rounded-lg animate-pulse" />}
      >
        <AdminProductsStats />
      </Suspense>

      {/* Products Content (Filters + Table) */}
      <AdminProductsContent />
    </AdminPageWrapper>
  );
}
