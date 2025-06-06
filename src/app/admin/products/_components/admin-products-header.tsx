import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminCreateProductDialog } from "./admin-create-product-dialog";
import { AdminProductsImportExport } from "./admin-products-import-export";

export function AdminProductsHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Sản phẩm</h1>
        <p className="mt-2 text-gray-600">
          Thêm, sửa và xóa sản phẩm trong cửa hàng
        </p>
      </div>

      <div className="flex items-center space-x-3">
        <AdminProductsImportExport />
        <AdminCreateProductDialog>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Thêm sản phẩm
          </Button>
        </AdminCreateProductDialog>
      </div>
    </div>
  );
}
