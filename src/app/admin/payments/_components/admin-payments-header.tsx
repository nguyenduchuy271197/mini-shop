import { Button } from "@/components/ui/button";
import { CreditCard, Download, RefreshCw } from "lucide-react";

interface AdminPaymentsHeaderProps {
  onExport: () => void;
  onRefresh: () => void;
  isExporting?: boolean;
  isLoading?: boolean;
}

export function AdminPaymentsHeader({
  onExport,
  onRefresh,
  isExporting = false,
  isLoading = false,
}: AdminPaymentsHeaderProps) {
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
      <div className="flex items-center space-x-2">
        <CreditCard className="h-6 w-6" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Quản lý thanh toán
          </h1>
          <p className="text-muted-foreground">
            Xem và quản lý các giao dịch thanh toán
          </p>
        </div>
      </div>

      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          <span>Làm mới</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          disabled={isExporting}
          className="flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>{isExporting ? "Đang xuất..." : "Xuất báo cáo"}</span>
        </Button>
      </div>
    </div>
  );
}
