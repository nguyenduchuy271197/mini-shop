"use client";

import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminCreateProductDialog } from "./admin-create-product-dialog";
import { AdminProductsImportExport } from "./admin-products-import-export";
import { useRefreshProducts } from "@/hooks/admin/products";

export function AdminProductsHeader() {
  const refreshMutation = useRefreshProducts();

  const handleRefresh = () => {
    refreshMutation.mutate();
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Sản phẩm</h1>
        <p className="mt-2 text-gray-600">
          Thêm, sửa và xóa sản phẩm trong cửa hàng
        </p>
      </div>

      <div className="flex items-center space-x-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshMutation.isPending}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${
              refreshMutation.isPending ? "animate-spin" : ""
            }`}
          />
          Làm mới
        </Button>
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
