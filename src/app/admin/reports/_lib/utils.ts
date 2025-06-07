import { format } from "date-fns";

// Get growth icon
export function getGrowthIcon(percentage: number): string {
  if (percentage > 0) return "trending-up";
  if (percentage < 0) return "trending-down";
  return "minus";
}

// Generate date range options - reports specific
export function getDateRangeOptions() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);
  
  const lastMonth = new Date(today);
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  const last3Months = new Date(today);
  last3Months.setMonth(last3Months.getMonth() - 3);
  
  const lastYear = new Date(today);
  lastYear.setFullYear(lastYear.getFullYear() - 1);

  return [
    {
      label: "Hôm nay",
      value: "today",
      startDate: format(today, "yyyy-MM-dd"),
      endDate: format(today, "yyyy-MM-dd"),
    },
    {
      label: "Hôm qua",
      value: "yesterday",
      startDate: format(yesterday, "yyyy-MM-dd"),
      endDate: format(yesterday, "yyyy-MM-dd"),
    },
    {
      label: "7 ngày qua",
      value: "last_7_days",
      startDate: format(lastWeek, "yyyy-MM-dd"),
      endDate: format(today, "yyyy-MM-dd"),
    },
    {
      label: "30 ngày qua",
      value: "last_30_days",
      startDate: format(lastMonth, "yyyy-MM-dd"),
      endDate: format(today, "yyyy-MM-dd"),
    },
    {
      label: "3 tháng qua",
      value: "last_3_months",
      startDate: format(last3Months, "yyyy-MM-dd"),
      endDate: format(today, "yyyy-MM-dd"),
    },
    {
      label: "1 năm qua",
      value: "last_year",
      startDate: format(lastYear, "yyyy-MM-dd"),
      endDate: format(today, "yyyy-MM-dd"),
    },
  ];
} 