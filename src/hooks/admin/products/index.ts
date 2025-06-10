// Admin Products Query Hooks
export { useAdminProducts } from "./use-admin-products";

// Admin Products Mutation Hooks
export { useCreateProduct } from "./use-create-product";
export { useUpdateProduct } from "./use-update-product";
export { useDeleteProduct } from "./use-delete-product";
export { useBulkUpdateProducts } from "./use-bulk-update-products";
export { useToggleProductStatus } from "./use-toggle-product-status";
export { useUpdateStock } from "./use-update-stock";
export { useUploadProductImages } from "./use-upload-product-images";
export { useExportProducts } from "./use-export-products";
export { useImportProducts } from "./use-import-products";
export { useRefreshProducts } from "./use-refresh-products";

// Export types
export type { 
  UseAdminProductsParams, 
  AdminProductsResponse, 
  ProductFilters,
  ProductWithCategory
} from "./use-admin-products";

export type { 
  CreateProductData, 
  UseCreateProductOptions 
} from "./use-create-product";

export type { 
  UpdateProductData, 
  UseUpdateProductOptions 
} from "./use-update-product";

export type { 
  DeleteProductData, 
  UseDeleteProductOptions 
} from "./use-delete-product";

export type { 
  BulkUpdateProductsData, 
  BulkUpdateData, 
  UseBulkUpdateProductsOptions 
} from "./use-bulk-update-products";

export type { 
  ToggleProductStatusData, 
  UseToggleProductStatusOptions 
} from "./use-toggle-product-status";

export type { 
  UpdateStockData, 
  UseUpdateStockOptions 
} from "./use-update-stock";

export type { 
  UploadProductImagesData, 
  UseUploadProductImagesOptions 
} from "./use-upload-product-images";

export type { 
  ExportProductsData, 
  ExportFilters, 
  UseExportProductsOptions 
} from "./use-export-products";

export type { 
  ImportProductsData, 
  UseImportProductsOptions 
} from "./use-import-products";

export type { 
  UseRefreshProductsOptions 
} from "./use-refresh-products"; 