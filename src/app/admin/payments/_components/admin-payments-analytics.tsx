"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePaymentAnalytics } from "@/hooks/admin/payments";
import { formatCurrency } from "@/lib/utils";
import { getPaymentMethodText, getPaymentMethodIcon } from "../_lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  CreditCard,
  DollarSign,
  BarChart3,
} from "lucide-react";

interface AdminPaymentsAnalyticsProps {
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export function AdminPaymentsAnalytics({
  dateRange,
}: AdminPaymentsAnalyticsProps) {
  const { data, isLoading, error } = usePaymentAnalytics({
    dateRange,
    groupBy: "day",
    includeComparison: true,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">
            Không thể tải dữ liệu analytics. Vui lòng thử lại.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { summary, comparison } = data.analytics;

  const renderTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-3 w-3 text-green-600" />;
    if (change < 0) return <TrendingDown className="h-3 w-3 text-red-600" />;
    return <Minus className="h-3 w-3 text-gray-400" />;
  };

  const renderTrendText = (change: number, label: string) => {
    const color =
      change > 0
        ? "text-green-600"
        : change < 0
        ? "text-red-600"
        : "text-gray-400";
    const sign = change > 0 ? "+" : "";
    return (
      <div className={`flex items-center gap-1 text-xs ${color}`}>
        {renderTrendIcon(change)}
        <span>
          {sign}
          {change.toFixed(1)}% {label}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng giao dịch
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.total_payments.toLocaleString()}
            </div>
            {comparison &&
              renderTrendText(
                comparison.change_percentage.payments,
                "so với kỳ trước"
              )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng doanh thu
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.total_amount)}
            </div>
            {comparison &&
              renderTrendText(
                comparison.change_percentage.amount,
                "so với kỳ trước"
              )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tỷ lệ thành công
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.success_rate.toFixed(1)}%
            </div>
            {comparison &&
              renderTrendText(
                comparison.change_percentage.success_rate,
                "so với kỳ trước"
              )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Giá trị TB/giao dịch
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.average_payment_value)}
            </div>
            <p className="text-xs text-muted-foreground">
              Dựa trên {summary.completed_payments} giao dịch thành công
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Status Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tình trạng thanh toán</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Hoàn thành</span>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-xs">
                  {summary.completed_payments}
                </Badge>
                <span className="text-sm font-medium">
                  {formatCurrency(summary.completed_amount)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Chờ xử lý</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {summary.pending_payments}
                </Badge>
                <span className="text-sm font-medium">
                  {formatCurrency(summary.pending_amount)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Thất bại</span>
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="text-xs">
                  {summary.failed_payments}
                </Badge>
                <span className="text-sm font-medium">
                  {formatCurrency(summary.failed_amount)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Đã hoàn tiền</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {summary.refunded_payments}
                </Badge>
                <span className="text-sm font-medium">
                  {formatCurrency(summary.refunded_amount)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Phương thức thanh toán</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.top_payment_methods.map((method) => (
              <div
                key={method.method}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {getPaymentMethodIcon(method.method)}
                  </span>
                  <span className="text-sm">
                    {getPaymentMethodText(method.method)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {method.count}
                  </Badge>
                  <span className="text-sm font-medium">
                    {method.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
