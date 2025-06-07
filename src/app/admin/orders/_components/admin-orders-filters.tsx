"use client";

import { useState, useCallback } from "react";
import { Search, Filter, X, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { OrderFilters } from "@/hooks/admin/orders";

interface AdminOrdersFiltersProps {
  onFiltersChange?: (filters: OrderFilters) => void;
}

export function AdminOrdersFilters({
  onFiltersChange,
}: AdminOrdersFiltersProps) {
  const [filters, setFilters] = useState<OrderFilters>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilters = useCallback(
    (newFilters: Partial<OrderFilters>) => {
      const updatedFilters = { ...filters, ...newFilters };
      setFilters(updatedFilters);
      onFiltersChange?.(updatedFilters);
    },
    [filters, onFiltersChange]
  );

  const clearFilters = () => {
    setFilters({});
    onFiltersChange?.({});
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(
      (value) => value !== undefined && value !== null && value !== ""
    ).length;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Bộ lọc đơn hàng
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount} bộ lọc
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Tìm kiếm</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Mã đơn, khách hàng..."
                value={filters.search || ""}
                onChange={(e) =>
                  updateFilters({ search: e.target.value || undefined })
                }
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label>Trạng thái</Label>
            <Select
              value={filters.status || "all"}
              onValueChange={(value) =>
                updateFilters({
                  status:
                    value === "all"
                      ? undefined
                      : (value as
                          | "pending"
                          | "confirmed"
                          | "processing"
                          | "shipped"
                          | "delivered"
                          | "cancelled"
                          | "refunded"),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="pending">Chờ xử lý</SelectItem>
                <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                <SelectItem value="processing">Đang xử lý</SelectItem>
                <SelectItem value="shipped">Đã giao vận</SelectItem>
                <SelectItem value="delivered">Đã giao hàng</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
                <SelectItem value="refunded">Đã hoàn tiền</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Status */}
          <div className="space-y-2">
            <Label>Thanh toán</Label>
            <Select
              value={filters.paymentStatus || "all"}
              onValueChange={(value) =>
                updateFilters({
                  paymentStatus:
                    value === "all"
                      ? undefined
                      : (value as "pending" | "paid" | "failed" | "refunded"),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái thanh toán" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="pending">Chờ thanh toán</SelectItem>
                <SelectItem value="paid">Đã thanh toán</SelectItem>
                <SelectItem value="failed">Thất bại</SelectItem>
                <SelectItem value="refunded">Đã hoàn tiền</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="flex items-end">
            <Popover open={showAdvanced} onOpenChange={setShowAdvanced}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Lọc nâng cao
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Từ ngày</Label>
                    <Input
                      type="date"
                      value={filters.dateFrom || ""}
                      onChange={(e) =>
                        updateFilters({ dateFrom: e.target.value || undefined })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Đến ngày</Label>
                    <Input
                      type="date"
                      value={filters.dateTo || ""}
                      onChange={(e) =>
                        updateFilters({ dateTo: e.target.value || undefined })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Số tiền tối thiểu</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={filters.minAmount || ""}
                      onChange={(e) =>
                        updateFilters({
                          minAmount: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Số tiền tối đa</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={filters.maxAmount || ""}
                      onChange={(e) =>
                        updateFilters({
                          maxAmount: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t">
            <span className="text-sm text-gray-600">Bộ lọc đang áp dụng:</span>

            {filters.search && (
              <Badge variant="secondary" className="gap-1">
                Tìm kiếm: {filters.search}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilters({ search: undefined })}
                />
              </Badge>
            )}

            {filters.status && (
              <Badge variant="secondary" className="gap-1">
                Trạng thái: {filters.status}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilters({ status: undefined })}
                />
              </Badge>
            )}

            {filters.paymentStatus && (
              <Badge variant="secondary" className="gap-1">
                Thanh toán: {filters.paymentStatus}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilters({ paymentStatus: undefined })}
                />
              </Badge>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4 mr-1" />
              Xóa tất cả
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
