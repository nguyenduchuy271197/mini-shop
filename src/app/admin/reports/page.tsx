import { DashboardOverview } from "./_components/dashboard-overview";

export default function ReportsPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Dashboard Quản Trị</h1>
        <p className="text-gray-600 mt-2">
          Tổng quan hệ thống và thống kê kinh doanh
        </p>
      </div>

      <DashboardOverview />
    </div>
  );
}
