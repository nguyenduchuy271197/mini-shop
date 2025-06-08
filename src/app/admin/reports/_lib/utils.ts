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
  // Set to start of day for accurate date ranges
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  // Set to end of day for end dates
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
  
  const yesterday = new Date(todayStart);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayEnd = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999);
  
  const lastWeek = new Date(todayStart);
  lastWeek.setDate(lastWeek.getDate() - 7);
  
  const lastMonth = new Date(todayStart);
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  const last3Months = new Date(todayStart);
  last3Months.setMonth(last3Months.getMonth() - 3);
  
  const lastYear = new Date(todayStart);
  lastYear.setFullYear(lastYear.getFullYear() - 1);

  return [
    {
      label: "Hôm nay",
      value: "today",
      startDate: todayStart.toISOString(),
      endDate: todayEnd.toISOString(),
    },
    {
      label: "Hôm qua",
      value: "yesterday",
      startDate: yesterday.toISOString(),
      endDate: yesterdayEnd.toISOString(),
    },
    {
      label: "7 ngày qua",
      value: "last_7_days",
      startDate: lastWeek.toISOString(),
      endDate: todayEnd.toISOString(),
    },
    {
      label: "30 ngày qua",
      value: "last_30_days",
      startDate: lastMonth.toISOString(),
      endDate: todayEnd.toISOString(),
    },
    {
      label: "3 tháng qua",
      value: "last_3_months",
      startDate: last3Months.toISOString(),
      endDate: todayEnd.toISOString(),
    },
    {
      label: "1 năm qua",
      value: "last_year",
      startDate: lastYear.toISOString(),
      endDate: todayEnd.toISOString(),
    },
  ];
} 