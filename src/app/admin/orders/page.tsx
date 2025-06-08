import { Suspense } from "react";
import { AdminPageWrapper } from "@/components/admin/admin-page-wrapper";
import { AdminOrdersTable } from "./_components/admin-orders-table";
import { AdminOrdersStats } from "./_components/admin-orders-stats";
import { AdminOrdersHeader } from "./_components/admin-orders-header";

export default function AdminOrdersPage() {
  return (
    <AdminPageWrapper>
      <AdminOrdersHeader />

      <Suspense
        fallback={<div className="h-32 bg-gray-100 rounded-lg animate-pulse" />}
      >
        <AdminOrdersStats />
      </Suspense>

      <Suspense
        fallback={<div className="h-96 bg-gray-100 rounded-lg animate-pulse" />}
      >
        <AdminOrdersTable />
      </Suspense>
    </AdminPageWrapper>
  );
}
