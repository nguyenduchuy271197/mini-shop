"use client";

import { useState } from "react";
import {
  useAdminProducts,
  type ProductWithCategory,
} from "@/hooks/admin/products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Edit3,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Package,
  Eye,
  Plus,
  Minus,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

interface AdminInventoryTableProps {
  filters: {
    searchTerm?: string;
    categoryId?: number;
    stockStatus?: "all" | "in_stock" | "low_stock" | "out_of_stock";
    sortBy?: "name" | "stock_quantity" | "updated_at";
    sortOrder?: "asc" | "desc";
  };
}

interface StockUpdate {
  productId: number;
  adjustment: number;
  reason: string;
  type: "increase" | "decrease" | "set";
}

export function AdminInventoryTable({ filters }: AdminInventoryTableProps) {
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductWithCategory | null>(null);
  const [stockUpdateDialog, setStockUpdateDialog] = useState(false);
  const [stockUpdate, setStockUpdate] = useState<StockUpdate>({
    productId: 0,
    adjustment: 0,
    reason: "",
    type: "increase",
  });
  const { toast } = useToast();

  // Get products with filters
  const { data: productsData, isLoading } = useAdminProducts({
    page,
    limit: 20,
    searchTerm: filters.searchTerm,
    category_id: filters.categoryId,
    isActive: true,
  });

  // Filter by stock status
  const filteredProducts = productsData?.products.filter((product) => {
    if (!filters.stockStatus) return true;

    const stock = product.stock_quantity || 0;
    const threshold = product.low_stock_threshold || 10;

    switch (filters.stockStatus) {
      case "in_stock":
        return stock > threshold;
      case "low_stock":
        return stock > 0 && stock <= threshold;
      case "out_of_stock":
        return stock === 0;
      default:
        return true;
    }
  });

  const getStockStatus = (product: ProductWithCategory) => {
    const stock = product.stock_quantity || 0;
    const threshold = product.low_stock_threshold || 10;

    if (stock === 0) {
      return {
        status: "out_of_stock",
        label: "Hết hàng",
        color: "bg-red-100 text-red-800",
        icon: XCircle,
      };
    } else if (stock <= threshold) {
      return {
        status: "low_stock",
        label: "Sắp hết",
        color: "bg-yellow-100 text-yellow-800",
        icon: AlertTriangle,
      };
    } else {
      return {
        status: "in_stock",
        label: "Còn hàng",
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
      };
    }
  };

  const handleStockUpdate = (
    product: ProductWithCategory,
    type: "increase" | "decrease"
  ) => {
    setSelectedProduct(product);
    setStockUpdate({
      productId: product.id,
      adjustment: type === "increase" ? 10 : -10,
      reason: type === "increase" ? "Nhập kho" : "Xuất kho",
      type,
    });
    setStockUpdateDialog(true);
  };

  const handleQuickStockUpdate = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Cập nhật thành công",
        description: `Đã cập nhật kho thành công cho sản phẩm "${selectedProduct?.name}"`,
      });
      setStockUpdateDialog(false);
      setStockUpdate({
        productId: 0,
        adjustment: 0,
        reason: "",
        type: "increase",
      });
    } catch {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi cập nhật kho",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Bảng quản lý kho hàng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Bảng quản lý kho hàng
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProducts && filteredProducts.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead className="text-center">Tồn kho</TableHead>
                    <TableHead className="text-center">
                      Ngưỡng cảnh báo
                    </TableHead>
                    <TableHead className="text-center">Trạng thái</TableHead>
                    <TableHead className="text-center">Giá bán</TableHead>
                    <TableHead className="text-center">Cập nhật cuối</TableHead>
                    <TableHead className="text-center">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product);
                    const IconComponent = stockStatus.icon;

                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                              {product.images && product.images.length > 0 ? (
                                <Image
                                  src={product.images[0]}
                                  alt={product.name}
                                  width={48}
                                  height={48}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Package className="h-6 w-6 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-gray-500">
                                SKU: {product.sku || "N/A"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {product.categories?.name || "Chưa phân loại"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="font-semibold text-lg">
                            {product.stock_quantity || 0}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="text-sm text-gray-600">
                            {product.low_stock_threshold || 10}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={stockStatus.color}>
                            <IconComponent className="h-3 w-3 mr-1" />
                            {stockStatus.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="font-medium">
                            {formatCurrency(product.price)}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="text-sm text-gray-600">
                            {product.updated_at
                              ? new Date(product.updated_at).toLocaleDateString(
                                  "vi-VN",
                                  {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  }
                                )
                              : "N/A"}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleStockUpdate(product, "increase")
                              }
                              title="Tăng tồn kho"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleStockUpdate(product, "decrease")
                              }
                              title="Giảm tồn kho"
                              disabled={(product.stock_quantity || 0) <= 0}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              title="Xem chi tiết"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                Không có sản phẩm nào
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại.
              </p>
            </div>
          )}

          {/* Pagination */}
          {productsData && productsData.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-gray-700">
                Hiển thị {(page - 1) * 20 + 1} -{" "}
                {Math.min(page * 20, productsData.total)}
                trong tổng số {productsData.total} sản phẩm
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage((p) => Math.min(productsData.totalPages, p + 1))
                  }
                  disabled={page === productsData.totalPages}
                >
                  Tiếp
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stock Update Dialog */}
      <Dialog open={stockUpdateDialog} onOpenChange={setStockUpdateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              Cập nhật tồn kho
            </DialogTitle>
            <DialogDescription>
              Cập nhật số lượng tồn kho cho sản phẩm &ldquo;
              {selectedProduct?.name}&rdquo;
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currentStock" className="text-right">
                Tồn kho hiện tại
              </Label>
              <div className="col-span-3 font-medium text-lg">
                {selectedProduct?.stock_quantity || 0} sản phẩm
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="adjustment" className="text-right">
                Điều chỉnh
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Button
                  type="button"
                  variant={
                    stockUpdate.type === "increase" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    setStockUpdate((prev) => ({ ...prev, type: "increase" }))
                  }
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Tăng
                </Button>
                <Button
                  type="button"
                  variant={
                    stockUpdate.type === "decrease" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    setStockUpdate((prev) => ({ ...prev, type: "decrease" }))
                  }
                >
                  <TrendingDown className="h-4 w-4 mr-1" />
                  Giảm
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Số lượng
              </Label>
              <Input
                id="amount"
                type="number"
                min="1"
                value={Math.abs(stockUpdate.adjustment)}
                onChange={(e) =>
                  setStockUpdate((prev) => ({
                    ...prev,
                    adjustment:
                      stockUpdate.type === "decrease"
                        ? -Number(e.target.value)
                        : Number(e.target.value),
                  }))
                }
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">
                Lý do
              </Label>
              <Textarea
                id="reason"
                value={stockUpdate.reason}
                onChange={(e) =>
                  setStockUpdate((prev) => ({
                    ...prev,
                    reason: e.target.value,
                  }))
                }
                placeholder="Nhập lý do cập nhật tồn kho..."
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Kết quả</Label>
              <div className="col-span-3 text-lg font-medium">
                {(selectedProduct?.stock_quantity || 0) +
                  stockUpdate.adjustment}{" "}
                sản phẩm
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setStockUpdateDialog(false)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleQuickStockUpdate}
              disabled={
                !stockUpdate.reason.trim() || stockUpdate.adjustment === 0
              }
            >
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
