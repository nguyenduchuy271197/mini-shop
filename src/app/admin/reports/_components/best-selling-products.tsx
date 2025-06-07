"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useBestSellingProducts,
  type BestSellingProduct,
} from "@/hooks/admin/reports";
import { DateRangePicker } from "./date-range-picker";
import { formatCurrency, formatNumber, formatPercentage } from "@/lib/utils";
import {
  TrendingUp,
  Package,
  BarChart3,
  RefreshCw,
  Download,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getDateRangeOptions } from "../_lib/utils";

interface DateRange {
  startDate: string;
  endDate: string;
}

interface BestSellingProductsProps {
  onExport?: (data: BestSellingProduct[]) => void;
}

export function BestSellingProducts({ onExport }: BestSellingProductsProps) {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const options = getDateRangeOptions();
    return {
      startDate: options[2].startDate, // "7 ngày qua"
      endDate: options[2].endDate,
    };
  });
  const [limit, setLimit] = useState(20);

  const { data, isLoading, error, refetch } = useBestSellingProducts({
    dateRange,
    limit,
  });

  const handleRefresh = async () => {
    try {
      await refetch();
      toast({
        title: "Đã cập nhật",
        description: "Báo cáo sản phẩm bán chạy đã được làm mới",
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
    if (data?.products && onExport) {
      onExport(data.products);
      toast({
        title: "Đã xuất báo cáo",
        description: "Báo cáo sản phẩm bán chạy đã được xuất thành công",
      });
    }
  };

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-600">
            <Package className="h-5 w-5" />
            <span>Không thể tải báo cáo sản phẩm bán chạy</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return <BestSellingProductsSkeleton />;
  }

  const products = data?.products || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sản Phẩm Bán Chạy</h2>
          <p className="text-gray-600">
            Thống kê sản phẩm bán chạy nhất và ít bán nhất
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

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bộ Lọc Báo Cáo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Khoảng thời gian
              </label>
              <DateRangePicker value={dateRange} onChange={setDateRange} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Số lượng hiển thị
              </label>
              <Select
                value={limit.toString()}
                onValueChange={(value) => setLimit(Number(value))}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">Top 10</SelectItem>
                  <SelectItem value="20">Top 20</SelectItem>
                  <SelectItem value="50">Top 50</SelectItem>
                  <SelectItem value="100">Top 100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {products.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Sản Phẩm Bán Chạy Nhất
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {products[0]?.productName}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatNumber(products[0]?.totalSold)} sản phẩm đã bán
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tổng Doanh Thu Top
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {formatCurrency(
                  products
                    .slice(0, 5)
                    .reduce((sum, p) => sum + p.totalRevenue, 0)
                )}
              </div>
              <p className="text-xs text-muted-foreground">Top 5 sản phẩm</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tổng Sản Phẩm Bán
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {formatNumber(
                  products.reduce((sum, p) => sum + p.totalSold, 0)
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Tất cả sản phẩm trong báo cáo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Giá Trung Bình
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {formatCurrency(
                  products.reduce((sum, p) => sum + p.averagePrice, 0) /
                    products.length
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Giá trung bình tất cả sản phẩm
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Best Selling Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Sản Phẩm Bán Chạy</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length > 0 ? (
            <div className="space-y-4">
              {products.map((product, index) => (
                <div key={product.productId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {product.productName}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          {product.productSku && (
                            <span>SKU: {product.productSku}</span>
                          )}
                          {product.category && (
                            <Badge variant="secondary">
                              {product.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(product.totalRevenue)}
                      </div>
                      <div className="text-sm text-gray-600">Doanh thu</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-600">
                        {formatNumber(product.totalSold)}
                      </div>
                      <div className="text-xs text-gray-600">Đã bán</div>
                    </div>

                    <div className="text-center">
                      <div className="text-xl font-bold text-purple-600">
                        {formatNumber(product.totalOrders)}
                      </div>
                      <div className="text-xs text-gray-600">Đơn hàng</div>
                    </div>

                    <div className="text-center">
                      <div className="text-xl font-bold text-green-600">
                        {formatCurrency(product.averagePrice)}
                      </div>
                      <div className="text-xs text-gray-600">Giá TB</div>
                    </div>

                    <div className="text-center">
                      <div className="text-xl font-bold text-orange-600">
                        {formatPercentage(product.conversionRate)}
                      </div>
                      <div className="text-xs text-gray-600">
                        Tỷ lệ chuyển đổi
                      </div>
                    </div>

                    <div className="text-center">
                      <div
                        className={`text-xl font-bold ${
                          product.stockRemaining < 10
                            ? "text-red-600"
                            : product.stockRemaining < 50
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {formatNumber(product.stockRemaining)}
                      </div>
                      <div className="text-xs text-gray-600">Tồn kho</div>
                    </div>
                  </div>

                  {product.stockRemaining < 10 && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">
                        Cảnh báo: Sản phẩm sắp hết hàng
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có dữ liệu sản phẩm
              </h3>
              <p className="text-gray-600 mb-4">
                Không tìm thấy sản phẩm nào trong khoảng thời gian đã chọn
              </p>
              <Button
                onClick={() => {
                  const options = getDateRangeOptions();
                  setDateRange({
                    startDate: options[3].startDate, // "30 ngày qua"
                    endDate: options[3].endDate,
                  });
                }}
                variant="outline"
              >
                Thử với 30 ngày qua
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Analysis */}
      {products.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Phân Tích Hiệu Suất</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Top Performers */}
              <div>
                <h4 className="font-semibold mb-3 text-green-600">
                  Top 5 Sản Phẩm Bán Chạy
                </h4>
                <div className="space-y-2">
                  {products.slice(0, 5).map((product, index) => (
                    <div
                      key={product.productId}
                      className="flex items-center justify-between p-2 bg-green-50 rounded"
                    >
                      <span className="text-sm">
                        {index + 1}. {product.productName}
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        {formatNumber(product.totalSold)} bán
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Low Performers */}
              <div>
                <h4 className="font-semibold mb-3 text-red-600">
                  5 Sản Phẩm Bán Ít Nhất
                </h4>
                <div className="space-y-2">
                  {products
                    .slice(-5)
                    .reverse()
                    .map((product) => (
                      <div
                        key={product.productId}
                        className="flex items-center justify-between p-2 bg-red-50 rounded"
                      >
                        <span className="text-sm">{product.productName}</span>
                        <span className="text-sm font-medium text-red-600">
                          {formatNumber(product.totalSold)} bán
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function BestSellingProductsSkeleton() {
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
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-80" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-3 w-20 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32 mt-1" />
                    </div>
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-16 mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-4 mt-4 pt-4 border-t">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} className="text-center">
                      <Skeleton className="h-6 w-12 mx-auto" />
                      <Skeleton className="h-3 w-8 mx-auto mt-1" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
