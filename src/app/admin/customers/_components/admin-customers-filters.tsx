"use client";

import { useState } from "react";
import { Search, Filter, X, CalendarDays, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { CustomerFilters } from "@/hooks/admin/users";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface AdminCustomersFiltersProps {
  filters: CustomerFilters;
  onFiltersChange: (filters: CustomerFilters) => void;
  onReset: () => void;
}

export function AdminCustomersFilters({
  filters,
  onFiltersChange,
  onReset,
}: AdminCustomersFiltersProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value || undefined });
  };

  const handleGenderChange = (value: string) => {
    onFiltersChange({
      ...filters,
      gender:
        value === "all" ? undefined : (value as "male" | "female" | "other"),
    });
  };

  const handleHasOrdersChange = (value: string) => {
    onFiltersChange({
      ...filters,
      hasOrders: value === "all" ? undefined : value === "true",
    });
  };

  const handleDateFromChange = (date: Date | undefined) => {
    onFiltersChange({
      ...filters,
      registeredAfter: date ? date.toISOString() : undefined,
    });
  };

  const handleDateToChange = (date: Date | undefined) => {
    onFiltersChange({
      ...filters,
      registeredBefore: date ? date.toISOString() : undefined,
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Chọn ngày";
    return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
  };

  return (
    <div className="space-y-4">
      {/* Tìm kiếm cơ bản */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm khách hàng..."
            value={filters.search || ""}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Bộ lọc nâng cao
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </div>

      {/* Bộ lọc nâng cao */}
      {isAdvancedOpen && (
        <div className="grid gap-4 p-4 border rounded-lg bg-muted/50 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>Giới tính</Label>
            <Select
              value={filters.gender || "all"}
              onValueChange={handleGenderChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="male">Nam</SelectItem>
                <SelectItem value="female">Nữ</SelectItem>
                <SelectItem value="other">Khác</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Trạng thái đơn hàng</Label>
            <Select
              value={
                filters.hasOrders === undefined
                  ? "all"
                  : filters.hasOrders
                  ? "true"
                  : "false"
              }
              onValueChange={handleHasOrdersChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="true">Có đơn hàng</SelectItem>
                <SelectItem value="false">Chưa có đơn hàng</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Đăng ký từ ngày</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {formatDate(filters.registeredAfter)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={
                    filters.registeredAfter
                      ? new Date(filters.registeredAfter)
                      : undefined
                  }
                  onSelect={handleDateFromChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Đăng ký đến ngày</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {formatDate(filters.registeredBefore)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={
                    filters.registeredBefore
                      ? new Date(filters.registeredBefore)
                      : undefined
                  }
                  onSelect={handleDateToChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}

      {/* Hiển thị bộ lọc đang áp dụng */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Bộ lọc:</span>

          {filters.search && (
            <Badge variant="secondary">
              Tìm kiếm: &ldquo;{filters.search}&rdquo;
              <X
                className="ml-1 h-3 w-3 cursor-pointer"
                onClick={() => handleSearchChange("")}
              />
            </Badge>
          )}

          {filters.gender && (
            <Badge variant="secondary">
              Giới tính:{" "}
              {filters.gender === "male"
                ? "Nam"
                : filters.gender === "female"
                ? "Nữ"
                : "Khác"}
              <X
                className="ml-1 h-3 w-3 cursor-pointer"
                onClick={() => handleGenderChange("all")}
              />
            </Badge>
          )}

          {filters.hasOrders !== undefined && (
            <Badge variant="secondary">
              {filters.hasOrders ? "Có đơn hàng" : "Chưa có đơn hàng"}
              <X
                className="ml-1 h-3 w-3 cursor-pointer"
                onClick={() => handleHasOrdersChange("all")}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
