"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminPayments, PaymentFilters } from "@/hooks/admin/payments";
import { AdminPaymentsTableView } from "./admin-payments-table-view";
import { AdminPaymentDetailDialog } from "./admin-payment-detail-dialog";
import { PaymentWithDetails } from "@/hooks/admin/payments";
import { Table } from "lucide-react";

interface AdminPaymentsTableProps {
  filters: PaymentFilters;
}

export function AdminPaymentsTable({ filters }: AdminPaymentsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithDetails | null>(null);

  const { data, isLoading, error, refetch } = useAdminPayments({
    pagination: {
      page: currentPage,
      limit: pageSize,
    },
    filters,
    includeOrder: true,
    includeCustomer: true,
  });

  const payments = useMemo(() => data?.payments || [], [data]);
  const pagination = useMemo(() => data?.pagination, [data]);
  const summary = useMemo(() => data?.summary, [data]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page
  };

  const handlePaymentSelect = (payment: PaymentWithDetails) => {
    setSelectedPayment(payment);
  };

  const handleCloseDialog = () => {
    setSelectedPayment(null);
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Table className="h-4 w-4" />
              Danh sách thanh toán
              {pagination && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({pagination.total.toLocaleString()} giao dịch)
                </span>
              )}
            </CardTitle>
          </div>
          
          {summary && (
            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
              <div>
                <span className="text-muted-foreground">Tổng giao dịch: </span>
                <span className="font-medium">{summary.total_payments.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Hoàn thành: </span>
                <span className="font-medium text-green-600">
                  {Object.values(summary.payments_by_status).reduce((a, b) => a + b, 0)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Tổng tiền: </span>
                <span className="font-medium">{(summary.total_amount / 1000000).toFixed(1)}M đ</span>
              </div>
              <div>
                <span className="text-muted-foreground">Thành công: </span>
                <span className="font-medium">{(summary.completed_amount / 1000000).toFixed(1)}M đ</span>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <AdminPaymentsTableView
            payments={payments}
            pagination={pagination}
            isLoading={isLoading}
            error={error}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onPaymentSelect={handlePaymentSelect}
            onRefresh={handleRefresh}
          />
        </CardContent>
      </Card>

      {/* Payment Detail Dialog */}
      <AdminPaymentDetailDialog
        payment={selectedPayment}
        open={!!selectedPayment}
        onClose={handleCloseDialog}
      />
    </>
  );
} 