"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStats } from "@/hooks/admin/reports";
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  getGrowthColor,
  formatOrderStatus,
  getStatusColor,
} from "@/lib/utils";
import {
  AlertCircle,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DashboardOverviewProps {
  onRefresh?: () => void;
}

export function DashboardOverview({ onRefresh }: DashboardOverviewProps) {
  const { toast } = useToast();
  const { data, isLoading, error, refetch } = useDashboardStats();

  const handleRefresh = async () => {
    try {
      await refetch();
      if (onRefresh) {
        onRefresh();
      }
      toast({
        title: "Đã cập nhật",
        description: "Dữ liệu thống kê đã được làm mới",
      });
    } catch {
      toast({
        title: "Lỗi",
        description: "Không thể làm mới dữ liệu",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>Không thể tải dữ liệu thống kê</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const stats = data?.stats;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Tổng Quan</h2>
          <p className="text-gray-600">Thống kê hiệu suất kinh doanh hôm nay</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Làm mới
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng Doanh Thu
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>Hôm nay: {formatCurrency(stats.revenueToday)}</span>
              {stats.revenueGrowthPercentage !== 0 && (
                <span className={getGrowthColor(stats.revenueGrowthPercentage)}>
                  {stats.revenueGrowthPercentage > 0 ? (
                    <TrendingUp className="h-3 w-3 inline" />
                  ) : (
                    <TrendingDown className="h-3 w-3 inline" />
                  )}
                  {formatPercentage(Math.abs(stats.revenueGrowthPercentage))}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Đơn Hàng</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(stats.totalOrders)}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>Hôm nay: {formatNumber(stats.totalOrdersToday)}</span>
              {stats.orderGrowthPercentage !== 0 && (
                <span className={getGrowthColor(stats.orderGrowthPercentage)}>
                  {stats.orderGrowthPercentage > 0 ? (
                    <TrendingUp className="h-3 w-3 inline" />
                  ) : (
                    <TrendingDown className="h-3 w-3 inline" />
                  )}
                  {formatPercentage(Math.abs(stats.orderGrowthPercentage))}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Total Customers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng Khách Hàng
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(stats.totalCustomers)}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>Mới hôm nay: {formatNumber(stats.newCustomersToday)}</span>
              {stats.customerGrowthPercentage !== 0 && (
                <span
                  className={getGrowthColor(stats.customerGrowthPercentage)}
                >
                  {stats.customerGrowthPercentage > 0 ? (
                    <TrendingUp className="h-3 w-3 inline" />
                  ) : (
                    <TrendingDown className="h-3 w-3 inline" />
                  )}
                  {formatPercentage(Math.abs(stats.customerGrowthPercentage))}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Average Order Value */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Giá Trị Đơn Hàng TB
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.averageOrderValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Sản phẩm sắp hết: {formatNumber(stats.productsLowStock)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Order Status Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Đơn Chờ Xử Lý</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatNumber(stats.pendingOrders)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Đơn Hoàn Thành</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatNumber(stats.completedOrders)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Đơn Đã Hủy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatNumber(stats.cancelledOrders)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tổng Thanh Toán</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatNumber(stats.totalPayments)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Selling Products */}
      <Card>
        <CardHeader>
          <CardTitle>Sản Phẩm Bán Chạy</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.topSellingProducts.length > 0 ? (
            <div className="space-y-3">
              {stats.topSellingProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-600">
                      Đã bán: {formatNumber(product.totalSold)} sản phẩm
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(product.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Chưa có dữ liệu sản phẩm bán chạy
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Đơn Hàng Gần Đây</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentOrders.length > 0 ? (
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex-1">
                    <p className="font-medium">#{order.order_number}</p>
                    <p className="text-sm text-gray-600">
                      {order.customer_name || "Khách hàng"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(order.status)}>
                      {formatOrderStatus(order.status)}
                    </Badge>
                    <span className="font-medium">
                      {formatCurrency(order.total_amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Chưa có đơn hàng nào
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>

      {/* Key Metrics */}
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

      {/* Order Status */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
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
    </div>
  );
}
