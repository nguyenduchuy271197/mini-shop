import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminCreateCategoryDialog } from "./admin-create-category-dialog";

export function AdminCategoriesHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Danh mục</h1>
        <p className="mt-2 text-gray-600">
          Thêm, sửa và xóa danh mục sản phẩm cho cửa hàng
        </p>
      </div>

      <div className="flex items-center space-x-3">
        <AdminCreateCategoryDialog>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Thêm danh mục
          </Button>
        </AdminCreateCategoryDialog>
      </div>
    </div>
  );
}
