"use client";

import { useState, useEffect } from "react";
import { useAdminProducts } from "@/hooks/admin/products";
import { AdminProductsTableRow } from "./admin-products-table-row";
import { AdminProductsTableSkeleton } from "./admin-products-table-skeleton";
import { AdminProductsTablePagination } from "./admin-products-table-pagination";
import { AdminProductsBulkActions } from "./admin-products-bulk-actions";
import { Checkbox } from "@/components/ui/checkbox";

interface ProductsFilters {
  searchTerm?: string;
  categoryId?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  stockStatus?: "in_stock" | "low_stock" | "out_of_stock";
}

interface AdminProductsTableProps {
  filters: ProductsFilters;
}

export function AdminProductsTable({ filters }: AdminProductsTableProps) {
  const [page, setPage] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const limit = 10;

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [
    filters.searchTerm,
    filters.categoryId,
    filters.isActive,
    filters.isFeatured,
    filters.minPrice,
    filters.maxPrice,
    filters.stockStatus,
  ]);

  // Convert filters to match useAdminProducts expected parameters
  const adminFilters = {
    searchTerm: filters.searchTerm,
    category_id: filters.categoryId,
    isActive: filters.isActive,
    is_featured: filters.isFeatured,
    min_price: filters.minPrice,
    max_price: filters.maxPrice,
    lowStock: filters.stockStatus === "low_stock",
    outOfStock: filters.stockStatus === "out_of_stock",
    in_stock: filters.stockStatus === "in_stock" ? true : undefined,
    page,
    limit,
  };

  const {
    data: productsData,
    isLoading,
    error,
  } = useAdminProducts(adminFilters);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(productsData?.products.map((p) => p.id) || []);
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId: number, checked: boolean) => {
    if (checked) {
      setSelectedProducts((prev) => [...prev, productId]);
    } else {
      setSelectedProducts((prev) => prev.filter((id) => id !== productId));
    }
  };

  const isAllSelected =
    (productsData?.products.length || 0) > 0 &&
    selectedProducts.length === (productsData?.products.length || 0);
  const isIndeterminate =
    selectedProducts.length > 0 &&
    selectedProducts.length < (productsData?.products.length || 0);

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center text-red-600">
          <p className="font-medium">Lỗi tải danh sách sản phẩm</p>
          <p className="text-sm mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 w-12">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    ref={(ref) => {
                      if (ref && ref instanceof HTMLInputElement) {
                        ref.indeterminate = isIndeterminate;
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sản phẩm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Danh mục
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kho
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <AdminProductsTableSkeleton />
              ) : productsData?.products.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center">
                      <p className="text-lg font-medium">
                        Không có sản phẩm nào
                      </p>
                      <p className="text-sm mt-1">
                        Bắt đầu bằng cách tạo sản phẩm đầu tiên
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                productsData?.products.map((product) => (
                  <AdminProductsTableRow
                    key={product.id}
                    product={product}
                    isSelected={selectedProducts.includes(product.id)}
                    onSelect={(checked) =>
                      handleSelectProduct(product.id, checked)
                    }
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {productsData && productsData.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <AdminProductsTablePagination
              currentPage={page}
              totalPages={productsData.totalPages}
              totalItems={productsData.total}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      <AdminProductsBulkActions
        selectedProducts={selectedProducts}
        onClearSelection={() => setSelectedProducts([])}
      />
    </>
  );
}
