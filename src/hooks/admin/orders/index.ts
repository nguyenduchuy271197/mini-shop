// Admin Orders Query Hooks
export { useAdminOrders } from "./use-admin-orders";
export { usePendingOrders } from "./use-pending-orders";
export { useOrderAnalytics } from "./use-order-analytics";

// Admin Orders Mutation Hooks
export { useBulkUpdateOrders } from "./use-bulk-update-orders";

// Export types
export type { 
  OrderFilters, 
  UseAdminOrdersParams, 
  OrderWithDetails, 
  OrderItemWithProduct,
  AdminOrdersResponse 
} from "./use-admin-orders";

export type { 
  UsePendingOrdersParams, 
  PendingOrderWithDetails, 
  PendingOrderItemWithProduct,
  PendingOrderAlert,
  PendingOrdersResponse 
} from "./use-pending-orders";

export type { 
  UseOrderAnalyticsParams,
  OrderAnalyticsData,
  ComparisonData,
  TopSellingProduct,
  OrderAnalyticsResponse 
} from "./use-order-analytics";

export type { 
  BulkUpdateOrdersData, 
  UpdatedOrder, 
  FailedOrder,
  BulkUpdateOrdersResponse,
  UseBulkUpdateOrdersOptions 
} from "./use-bulk-update-orders"; 