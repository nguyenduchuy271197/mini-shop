import { Users, Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminCustomersHeaderProps {
  onRefresh: () => void;
  onExport: () => void;
  isLoading?: boolean;
  totalCustomers?: number;
}

export function AdminCustomersHeader({
  onRefresh,
  onExport,
  isLoading = false,
  totalCustomers = 0,
}: AdminCustomersHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold tracking-tight">
            Quản lý khách hàng
          </h1>
        </div>
        <p className="text-muted-foreground">
          Quản lý thông tin khách hàng, lịch sử mua hàng và phân tích hành vi
        </p>
        {totalCustomers > 0 && (
          <p className="text-sm text-muted-foreground">
            Tổng cộng:{" "}
            <span className="font-medium">
              {totalCustomers.toLocaleString()}
            </span>{" "}
            khách hàng
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RotateCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Làm mới
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Xuất CSV
        </Button>
      </div>
    </div>
  );
}
