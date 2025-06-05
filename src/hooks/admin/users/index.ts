// Admin users query hooks
export { useAdminCustomers } from "./use-admin-customers";
export { useCustomerDetails } from "./use-customer-details";
export { useCustomerOrders } from "./use-customer-orders";

// Admin users mutation hooks
export { useUpdateCustomerStatus } from "./use-update-customer-status";
export { useExportCustomers } from "./use-export-customers";

// Export types
export type { 
  UseAdminCustomersParams, 
  CustomerFilters, 
  CustomerInfo, 
  AdminCustomersResponse 
} from "./use-admin-customers";

export type { 
  UseCustomerDetailsParams, 
  CustomerDetails, 
  CustomerStatistics, 
  CustomerActivitySummary 
} from "./use-customer-details";

export type { 
  UseCustomerOrdersParams, 
  CustomerOrderFilters, 
  OrderWithItems, 
  OrdersSummary, 
  CustomerOrdersResponse 
} from "./use-customer-orders";

export type { 
  UpdateCustomerStatusData, 
  UseUpdateCustomerStatusOptions 
} from "./use-update-customer-status";

export type { 
  ExportCustomersData, 
  ExportCustomersFilters, 
  UseExportCustomersOptions 
} from "./use-export-customers"; 