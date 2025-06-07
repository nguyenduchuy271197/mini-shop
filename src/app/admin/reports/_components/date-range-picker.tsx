"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { getDateRangeOptions } from "../_lib/utils";
import type { DateRange } from "@/hooks/admin/reports";

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

export function DateRangePicker({
  value,
  onChange,
  className,
}: DateRangePickerProps) {
  const [isCustom, setIsCustom] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<Date | undefined>(
    value.startDate ? new Date(value.startDate) : undefined
  );
  const [tempEndDate, setTempEndDate] = useState<Date | undefined>(
    value.endDate ? new Date(value.endDate) : undefined
  );

  const dateRangeOptions = getDateRangeOptions();

  const handlePresetChange = (presetValue: string) => {
    if (presetValue === "custom") {
      setIsCustom(true);
      return;
    }

    const preset = dateRangeOptions.find(
      (option) => option.value === presetValue
    );
    if (preset) {
      onChange({
        startDate: preset.startDate,
        endDate: preset.endDate,
      });
      setIsCustom(false);
    }
  };

  const handleCustomApply = () => {
    if (tempStartDate && tempEndDate) {
      onChange({
        startDate: format(tempStartDate, "yyyy-MM-dd"),
        endDate: format(tempEndDate, "yyyy-MM-dd"),
      });
      setIsCustom(false);
    }
  };

  const getCurrentLabel = () => {
    const preset = dateRangeOptions.find(
      (option) =>
        option.startDate === value.startDate && option.endDate === value.endDate
    );

    if (preset) {
      return preset.label;
    }

    if (value.startDate && value.endDate) {
      const start = format(new Date(value.startDate), "dd/MM/yyyy", {
        locale: vi,
      });
      const end = format(new Date(value.endDate), "dd/MM/yyyy", { locale: vi });
      return `${start} - ${end}`;
    }

    return "Chọn khoảng thời gian";
  };

  const canClearCustom = () => {
    return !dateRangeOptions.some(
      (option) =>
        option.startDate === value.startDate && option.endDate === value.endDate
    );
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select
        value={
          isCustom
            ? "custom"
            : dateRangeOptions.find(
                (option) =>
                  option.startDate === value.startDate &&
                  option.endDate === value.endDate
              )?.value || "custom"
        }
        onValueChange={handlePresetChange}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Chọn khoảng thời gian">
            {getCurrentLabel()}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {dateRangeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
          <SelectItem value="custom">Tùy chỉnh...</SelectItem>
        </SelectContent>
      </Select>

      {/* Custom Date Range Popover */}
      {isCustom && (
        <Popover open={isCustom} onOpenChange={setIsCustom}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Chọn ngày
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Từ ngày
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !tempStartDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {tempStartDate
                          ? format(tempStartDate, "dd/MM/yyyy", { locale: vi })
                          : "Chọn ngày bắt đầu"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={tempStartDate}
                        onSelect={setTempStartDate}
                        disabled={(date) =>
                          date > new Date() ||
                          (tempEndDate ? date > tempEndDate : false)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Đến ngày
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !tempEndDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {tempEndDate
                          ? format(tempEndDate, "dd/MM/yyyy", { locale: vi })
                          : "Chọn ngày kết thúc"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={tempEndDate}
                        onSelect={setTempEndDate}
                        disabled={(date) =>
                          date > new Date() ||
                          (tempStartDate ? date < tempStartDate : false)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  onClick={handleCustomApply}
                  disabled={!tempStartDate || !tempEndDate}
                  size="sm"
                >
                  Áp dụng
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsCustom(false)}
                  size="sm"
                >
                  Hủy
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Clear Custom Range */}
      {canClearCustom() && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const defaultOption = dateRangeOptions[2]; // "7 ngày qua"
            onChange({
              startDate: defaultOption.startDate,
              endDate: defaultOption.endDate,
            });
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
