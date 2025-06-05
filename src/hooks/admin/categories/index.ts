// Admin categories query hooks
export { useAdminCategories } from "./use-admin-categories";

// Admin categories mutation hooks
export { useCreateCategory } from "./use-create-category";
export { useUpdateCategory } from "./use-update-category";
export { useDeleteCategory } from "./use-delete-category";
export { useReorderCategories } from "./use-reorder-categories";
export { useUploadCategoryImage } from "./use-upload-category-image";

// Export types
export type { 
  UseAdminCategoriesParams, 
  AdminCategoriesResponse, 
  AdminCategoryFilters 
} from "./use-admin-categories";

export type { 
  CreateCategoryData, 
  UseCreateCategoryOptions 
} from "./use-create-category";

export type { 
  UpdateCategoryData, 
  UseUpdateCategoryOptions 
} from "./use-update-category";

export type { 
  DeleteCategoryData, 
  UseDeleteCategoryOptions 
} from "./use-delete-category";

export type { 
  ReorderCategoriesData, 
  CategoryOrder, 
  UseReorderCategoriesOptions 
} from "./use-reorder-categories";

export type { 
  UploadCategoryImageData, 
  UseUploadCategoryImageOptions 
} from "./use-upload-category-image"; 