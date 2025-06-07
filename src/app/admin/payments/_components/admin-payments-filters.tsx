"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { PaymentFilters } from "@/hooks/admin/payments";

interface AdminPaymentsFiltersProps {
  filters: PaymentFilters;
  onFiltersChange: (filters: PaymentFilters) => void;
  onReset: () => void;
}

export function AdminPaymentsFilters({
  filters,
  onFiltersChange,
  onReset,
}: AdminPaymentsFiltersProps) {
  const [fromDate, setFromDate] = useState<Date | undefined>(
    filters.dateFrom ? new Date(filters.dateFrom) : undefined
  );
  const [toDate, setToDate] = useState<Date | undefined>(
    filters.dateTo ? new Date(filters.dateTo) : undefined
  );

  const handleFilterChange = (
    key: keyof PaymentFilters,
    value: string | number | undefined
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const handleDateFromChange = (date: Date | undefined) => {
    setFromDate(date);
    handleFilterChange(
      "dateFrom",
      date ? format(date, "yyyy-MM-dd") : undefined
    );
  };

  const handleDateToChange = (date: Date | undefined) => {
    setToDate(date);
    handleFilterChange("dateTo", date ? format(date, "yyyy-MM-dd") : undefined);
  };

  const handleReset = () => {
    setFromDate(undefined);
    setToDate(undefined);
    onReset();
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Bộ lọc
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleReset}>
              <X className="h-4 w-4 mr-1" />
              Xóa tất cả
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Transaction ID */}
          <div className="space-y-2">
            <Label htmlFor="transactionId">Mã giao dịch</Label>
            <Input
              id="transactionId"
              placeholder="Nhập mã giao dịch..."
              value={filters.transactionId || ""}
              onChange={(e) =>
                handleFilterChange("transactionId", e.target.value)
              }
            />
          </div>

          {/* Order ID */}
          <div className="space-y-2">
            <Label htmlFor="orderId">Mã đơn hàng</Label>
            <Input
              id="orderId"
              type="number"
              placeholder="Nhập mã đơn hàng..."
              value={filters.orderId || ""}
              onChange={(e) =>
                handleFilterChange(
                  "orderId",
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
            />
          </div>

          {/* Customer ID */}
          <div className="space-y-2">
            <Label htmlFor="customerId">Mã khách hàng</Label>
            <Input
              id="customerId"
              placeholder="Nhập mã khách hàng..."
              value={filters.customerId || ""}
              onChange={(e) => handleFilterChange("customerId", e.target.value)}
            />
          </div>

          {/* Payment Status */}
          <div className="space-y-2">
            <Label>Trạng thái</Label>
            <Select
              value={filters.status || "all"}
              onValueChange={(value) =>
                handleFilterChange(
                  "status",
                  value === "all" ? undefined : value
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="pending">Chờ xử lý</SelectItem>
                <SelectItem value="processing">Đang xử lý</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
                <SelectItem value="failed">Thất bại</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
                <SelectItem value="refunded">Đã hoàn tiền</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label>Phương thức thanh toán</Label>
            <Select
              value={filters.paymentMethod || "all"}
              onValueChange={(value) =>
                handleFilterChange(
                  "paymentMethod",
                  value === "all" ? undefined : value
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn phương thức..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả phương thức</SelectItem>
                <SelectItem value="vnpay">VNPay</SelectItem>
                <SelectItem value="momo">MoMo</SelectItem>
                <SelectItem value="cod">Thanh toán khi nhận hàng</SelectItem>
                <SelectItem value="bank_transfer">
                  Chuyển khoản ngân hàng
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date From */}
          <div className="space-y-2">
            <Label>Từ ngày</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !fromDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fromDate
                    ? format(fromDate, "dd/MM/yyyy", { locale: vi })
                    : "Chọn ngày bắt đầu"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fromDate}
                  onSelect={handleDateFromChange}
                  disabled={(date) =>
                    date > new Date() || (toDate ? date > toDate : false)
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Date To */}
          <div className="space-y-2">
            <Label>Đến ngày</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !toDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {toDate
                    ? format(toDate, "dd/MM/yyyy", { locale: vi })
                    : "Chọn ngày kết thúc"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={toDate}
                  onSelect={handleDateToChange}
                  disabled={(date) =>
                    date > new Date() || (fromDate ? date < fromDate : false)
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Min Amount */}
          <div className="space-y-2">
            <Label htmlFor="minAmount">Số tiền tối thiểu</Label>
            <Input
              id="minAmount"
              type="number"
              placeholder="0"
              value={filters.minAmount || ""}
              onChange={(e) =>
                handleFilterChange(
                  "minAmount",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            />
          </div>

          {/* Max Amount */}
          <div className="space-y-2">
            <Label htmlFor="maxAmount">Số tiền tối đa</Label>
            <Input
              id="maxAmount"
              type="number"
              placeholder="Không giới hạn"
              value={filters.maxAmount || ""}
              onChange={(e) =>
                handleFilterChange(
                  "maxAmount",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            />
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {filters.status && (
              <Badge variant="secondary" className="gap-1">
                Trạng thái: {filters.status}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleFilterChange("status", undefined)}
                />
              </Badge>
            )}
            {filters.paymentMethod && (
              <Badge variant="secondary" className="gap-1">
                Phương thức: {filters.paymentMethod}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleFilterChange("paymentMethod", undefined)}
                />
              </Badge>
            )}
            {filters.dateFrom && (
              <Badge variant="secondary" className="gap-1">
                Từ: {format(new Date(filters.dateFrom), "dd/MM/yyyy")}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleDateFromChange(undefined)}
                />
              </Badge>
            )}
            {filters.dateTo && (
              <Badge variant="secondary" className="gap-1">
                Đến: {format(new Date(filters.dateTo), "dd/MM/yyyy")}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleDateToChange(undefined)}
                />
              </Badge>
            )}
            {filters.minAmount && (
              <Badge variant="secondary" className="gap-1">
                Tối thiểu: {filters.minAmount.toLocaleString()}đ
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleFilterChange("minAmount", undefined)}
                />
              </Badge>
            )}
            {filters.maxAmount && (
              <Badge variant="secondary" className="gap-1">
                Tối đa: {filters.maxAmount.toLocaleString()}đ
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleFilterChange("maxAmount", undefined)}
                />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
