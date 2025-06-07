"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useRevenueAnalytics,
  type RevenueAnalytics as RevenueAnalyticsType,
} from "@/hooks/admin/reports";
import { DateRangePicker } from "./date-range-picker";
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  getGrowthColor,
  formatChartDate,
} from "@/lib/utils";
import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Receipt,
  RefreshCw,
  Download,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getDateRangeOptions } from "../_lib/utils";

interface DateRange {
  startDate: string;
  endDate: string;
}

interface RevenueAnalyticsProps {
  onExport?: (data: RevenueAnalyticsType) => void;
}

export function RevenueAnalytics({ onExport }: RevenueAnalyticsProps) {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const options = getDateRangeOptions();
    return {
      startDate: options[2].startDate, // "7 ngày qua"
      endDate: options[2].endDate,
    };
  });

  const { data, isLoading, error, refetch } = useRevenueAnalytics({
    dateRange,
  });

  const handleRefresh = async () => {
    try {
      await refetch();
      toast({
        title: "Đã cập nhật",
        description: "Báo cáo doanh thu đã được làm mới",
      });
    } catch {
      toast({
        title: "Lỗi",
        description: "Không thể làm mới báo cáo",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    if (data?.analytics && onExport) {
      onExport(data.analytics);
      toast({
        title: "Đã xuất báo cáo",
        description: "Báo cáo doanh thu đã được xuất thành công",
      });
    }
  };

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-600">
            <Receipt className="h-5 w-5" />
            <span>Không thể tải báo cáo doanh thu</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return <RevenueAnalyticsSkeleton />;
  }

  const analytics = data?.analytics;
  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Báo Cáo Doanh Thu</h2>
          <p className="text-gray-600">
            Phân tích chi tiết doanh thu theo thời gian
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Xuất báo cáo
          </Button>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Date Range Picker */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Chọn Khoảng Thời Gian</CardTitle>
        </CardHeader>
        <CardContent>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </CardContent>
      </Card>

      {/* Revenue Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng Doanh Thu
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analytics.totalRevenue)}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>So với kỳ trước:</span>
              {analytics.monthlyComparison.growthPercentage !== 0 && (
                <span
                  className={getGrowthColor(
                    analytics.monthlyComparison.growthPercentage
                  )}
                >
                  {analytics.monthlyComparison.growthPercentage > 0 ? (
                    <TrendingUp className="h-3 w-3 inline" />
                  ) : (
                    <TrendingDown className="h-3 w-3 inline" />
                  )}
                  {formatPercentage(
                    Math.abs(analytics.monthlyComparison.growthPercentage)
                  )}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh Thu Gộp</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analytics.grossRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Trước khuyến mãi và thuế
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Doanh Thu Ròng
            </CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analytics.netRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Sau khuyến mãi và thuế
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Giá Trị Đơn Hàng TB
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analytics.averageOrderValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Trung bình mỗi đơn hàng
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tổng Giảm Giá</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-orange-600">
              {formatCurrency(analytics.totalDiscounts)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tổng Thuế</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-blue-600">
              {formatCurrency(analytics.totalTax)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Phí Vận Chuyển</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-purple-600">
              {formatCurrency(analytics.totalShipping)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tổng Hoàn Trả</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-red-600">
              {formatCurrency(analytics.totalRefunds)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Doanh Thu Theo Ngày</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.dailyRevenue.length > 0 ? (
            <div className="space-y-3">
              {analytics.dailyRevenue.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{formatChartDate(item.date)}</p>
                    <p className="text-sm text-gray-600">
                      {formatNumber(item.orders)} đơn hàng
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(item.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Chưa có dữ liệu doanh thu theo ngày
            </p>
          )}
        </CardContent>
      </Card>

      {/* Revenue by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Doanh Thu Theo Danh Mục</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.revenueByCategory.length > 0 ? (
            <div className="space-y-3">
              {analytics.revenueByCategory.map((category, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{category.categoryName}</p>
                    <p className="text-sm text-gray-600">
                      {formatPercentage(category.percentage)} tổng doanh thu
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(category.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Chưa có dữ liệu doanh thu theo danh mục
            </p>
          )}
        </CardContent>
      </Card>

      {/* Revenue by Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Doanh Thu Theo Phương Thức Thanh Toán</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.revenueByPaymentMethod.length > 0 ? (
            <div className="space-y-3">
              {analytics.revenueByPaymentMethod.map((method, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{method.paymentMethod}</p>
                    <p className="text-sm text-gray-600">
                      {formatPercentage(method.percentage)} tổng doanh thu
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(method.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Chưa có dữ liệu doanh thu theo phương thức thanh toán
            </p>
          )}
        </CardContent>
      </Card>

      {/* Period Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>So Sánh Với Kỳ Trước</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Kỳ hiện tại</p>
              <p className="text-xl font-bold">
                {formatCurrency(analytics.monthlyComparison.currentPeriod)}
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Kỳ trước</p>
              <p className="text-xl font-bold">
                {formatCurrency(analytics.monthlyComparison.previousPeriod)}
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Thay đổi</p>
              <div className="flex items-center justify-center gap-1">
                {analytics.monthlyComparison.growthPercentage > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : analytics.monthlyComparison.growthPercentage < 0 ? (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                ) : null}
                <span
                  className={`text-xl font-bold ${getGrowthColor(
                    analytics.monthlyComparison.growthPercentage
                  )}`}
                >
                  {analytics.monthlyComparison.growthPercentage > 0 ? "+" : ""}
                  {formatPercentage(
                    analytics.monthlyComparison.growthPercentage
                  )}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RevenueAnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-80" />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-20 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div
                  key={j}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24 mt-1" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
