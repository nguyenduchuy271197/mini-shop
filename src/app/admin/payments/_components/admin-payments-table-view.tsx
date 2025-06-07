import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, AlertCircle, RefreshCw } from "lucide-react";
import { PaymentWithDetails } from "@/hooks/admin/payments";
import { formatCurrency } from "@/lib/utils";
import {
  getPaymentStatusBadgeVariant,
  getPaymentStatusText,
  getPaymentMethodText,
  getPaymentMethodIcon,
  formatPaymentDate,
} from "../_lib/utils";

interface AdminPaymentsTableViewProps {
  payments: PaymentWithDetails[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: Error | null;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onPaymentSelect: (payment: PaymentWithDetails) => void;
  onRefresh: () => void;
}

export function AdminPaymentsTableView({
  payments,
  pagination,
  isLoading,
  error,
  onPageChange,
  onPageSizeChange,
  onPaymentSelect,
  onRefresh,
}: AdminPaymentsTableViewProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã GD</TableHead>
                <TableHead>Đơn hàng</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Phương thức</TableHead>
                <TableHead>Số tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-16" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <AlertCircle className="h-8 w-8 text-muted-foreground" />
        <div className="text-center">
          <p className="text-sm font-medium">
            Không thể tải dữ liệu thanh toán
          </p>
          <p className="text-xs text-muted-foreground">{error.message}</p>
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Thử lại
        </Button>
      </div>
    );
  }

  if (!payments.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <div className="text-center">
          <p className="text-sm font-medium">
            Không có giao dịch thanh toán nào
          </p>
          <p className="text-xs text-muted-foreground">
            Hãy thử điều chỉnh bộ lọc để xem kết quả khác
          </p>
        </div>
      </div>
    );
  }

  const startItem = pagination
    ? (pagination.page - 1) * pagination.limit + 1
    : 1;
  const endItem = pagination
    ? Math.min(pagination.page * pagination.limit, pagination.total)
    : payments.length;

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã GD</TableHead>
              <TableHead>Đơn hàng</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Phương thức</TableHead>
              <TableHead className="text-right">Số tiền</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-center">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-mono text-sm">
                  {payment.transaction_id ? (
                    <span className="truncate max-w-[120px] block">
                      {payment.transaction_id}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">#{payment.id}</span>
                  )}
                </TableCell>
                <TableCell>
                  {payment.order ? (
                    <div className="space-y-1">
                      <span className="font-medium">
                        {payment.order.order_number}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        ID: {payment.order.id}
                      </p>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">N/A</span>
                  )}
                </TableCell>
                <TableCell>
                  {payment.order?.customer ? (
                    <div className="space-y-1">
                      <span className="font-medium">
                        {payment.order.customer.full_name}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {payment.order.customer.email}
                      </p>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">
                      Khách vãng lai
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {getPaymentMethodIcon(payment.payment_method)}
                    </span>
                    <span className="text-sm">
                      {getPaymentMethodText(payment.payment_method)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(payment.amount)}
                </TableCell>
                <TableCell>
                  <Badge variant={getPaymentStatusBadgeVariant(payment.status)}>
                    {getPaymentStatusText(payment.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <span className="text-sm">
                      {formatPaymentDate(payment.created_at)}
                    </span>
                    {payment.processed_at && (
                      <p className="text-xs text-muted-foreground">
                        Xử lý: {formatPaymentDate(payment.processed_at)}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPaymentSelect(payment)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <p className="text-sm text-muted-foreground">
              Hiển thị {startItem} đến {endItem} trong tổng số{" "}
              {pagination.total.toLocaleString()} giao dịch
            </p>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Hiển thị</p>
              <Select
                value={pagination.limit.toString()}
                onValueChange={(value) => onPageSizeChange(Number(value))}
              >
                <SelectTrigger className="h-8 w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                Trước
              </Button>

              <div className="flex items-center gap-1">
                {(() => {
                  const totalPages = pagination.totalPages;
                  const currentPage = pagination.page;
                  const pages = [];

                  let startPage = Math.max(1, currentPage - 2);
                  const endPage = Math.min(totalPages, startPage + 4);

                  if (endPage - startPage < 4) {
                    startPage = Math.max(1, endPage - 4);
                  }

                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <Button
                        key={i}
                        variant={currentPage === i ? "default" : "outline"}
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => onPageChange(i)}
                      >
                        {i}
                      </Button>
                    );
                  }

                  return pages;
                })()}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
              >
                Sau
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
