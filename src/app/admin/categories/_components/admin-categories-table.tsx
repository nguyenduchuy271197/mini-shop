"use client";

import { useState } from "react";
import { useAdminCategories } from "@/hooks/admin/categories";
import { AdminCategoriesTableRow } from "./admin-categories-table-row";
import { AdminCategoriesTableSkeleton } from "./admin-categories-table-skeleton";
import { AdminCategoriesTablePagination } from "./admin-categories-table-pagination";
import { AdminCategoriesTableFilters } from "./admin-categories-table-filters";

interface CategoriesFilters {
  searchTerm?: string;
  isActive?: boolean;
  parentId?: number | null;
}

export function AdminCategoriesTable() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<CategoriesFilters>({});
  const limit = 10;

  const {
    data: categoriesData,
    isLoading,
    error,
  } = useAdminCategories({
    ...filters,
    page,
    limit,
  });

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center text-red-600">
          <p className="font-medium">Lỗi tải danh sách danh mục</p>
          <p className="text-sm mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Filters */}
      <div className="p-6 border-b border-gray-200">
        <AdminCategoriesTableFilters
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Danh mục
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Danh mục cha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sản phẩm
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
              <AdminCategoriesTableSkeleton />
            ) : categoriesData?.categories.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center">
                    <p className="text-lg font-medium">Không có danh mục nào</p>
                    <p className="text-sm mt-1">
                      Bắt đầu bằng cách tạo danh mục đầu tiên
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              categoriesData?.categories.map((category) => (
                <AdminCategoriesTableRow
                  key={category.id}
                  category={category}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {categoriesData && categoriesData.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <AdminCategoriesTablePagination
            currentPage={page}
            totalPages={categoriesData.totalPages}
            totalItems={categoriesData.total}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
