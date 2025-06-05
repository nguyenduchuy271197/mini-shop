// Report query hooks
export { useSalesReport } from "./use-sales-report";
export { useRevenueAnalytics } from "./use-revenue-analytics";
export { useCustomerAnalytics } from "./use-customer-analytics";
export { useBestSellingProducts } from "./use-best-selling-products";
export { useDashboardStats } from "./use-dashboard-stats";
export { useProductPerformance } from "./use-product-performance";
export { useInventoryReport } from "./use-inventory-report";

// Report mutation hooks
export { useExportSalesReport } from "./use-export-sales-report";

// Export types from sales report
export type { 
  DateRange as SalesDateRange,
  ReportGroupBy,
  UseSalesReportParams, 
  SalesReportItem,
  SalesReportSummary, 
  SalesReportResponse 
} from "./use-sales-report";

// Export types from revenue analytics
export type { 
  DateRange as RevenueDate,
  UseRevenueAnalyticsParams, 
  RevenueAnalytics, 
  RevenueAnalyticsResponse 
} from "./use-revenue-analytics";

// Export types from customer analytics
export type { 
  DateRange as CustomerDate,
  UseCustomerAnalyticsParams, 
  CustomerAnalytics, 
  CustomerAnalyticsResponse 
} from "./use-customer-analytics";

// Export types from best selling products
export type { 
  DateRange as BestSellingDate,
  UseBestSellingProductsParams, 
  BestSellingProduct, 
  BestSellingProductsResponse 
} from "./use-best-selling-products";

// Export types from dashboard stats
export type { 
  DashboardStats, 
  DashboardStatsResponse 
} from "./use-dashboard-stats";

// Export types from product performance
export type { 
  DateRange as ProductPerformanceDate,
  UseProductPerformanceParams, 
  ProductPerformanceItem, 
  ProductPerformanceResponse 
} from "./use-product-performance";

// Export types from inventory report
export type { 
  InventoryItem,
  InventoryReportSummary, 
  InventoryReportResponse 
} from "./use-inventory-report";

// Export types from export sales report
export type { 
  DateRange as ExportDateRange,
  ExportFormat,
  ExportSalesReportData, 
  ExportSalesReportResponse,
  UseExportSalesReportOptions 
} from "./use-export-sales-report";

// Common types re-export
export type DateRange = {
  startDate: string;
  endDate: string;
}; 