"use client";

import { useAdminProducts } from "@/hooks/admin/products";
import { AlertTriangle, Package, Plus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export function AdminLowStockAlertWrapper() {
  const { toast } = useToast();

  // Get products and filter for low stock
  const { data: productsData, isLoading } = useAdminProducts({
    page: 1,
    limit: 100,
    isActive: true,
  });

  if (isLoading) {
    return <div className="h-20 bg-orange-100 rounded-lg animate-pulse" />;
  }

  const products = productsData?.products || [];

  // Filter for low stock products (stock > 0 but <= threshold)
  const lowStockProducts = products
    .filter((product) => {
      const stock = product.stock_quantity || 0;
      const threshold = product.low_stock_threshold || 10;
      return stock > 0 && stock <= threshold;
    })
    .sort((a, b) => (a.stock_quantity || 0) - (b.stock_quantity || 0)) // Sort by lowest stock first
    .slice(0, 5); // Show only top 5

  const handleQuickRestock = (productName: string) => {
    toast({
      title: "Thêm vào danh sách nhập kho",
      description: `Đã thêm vào danh sách nhập kho: ${productName}`,
    });
  };

  if (lowStockProducts.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-green-600" />
            <div>
              <h3 className="font-medium text-green-800">Tình trạng kho tốt</h3>
              <p className="text-sm text-green-700">
                Hiện tại không có sản phẩm nào sắp hết hàng
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Alert className="border-orange-200 bg-orange-50">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-800">
        Cảnh báo: {lowStockProducts.length} sản phẩm sắp hết hàng
      </AlertTitle>
      <AlertDescription className="text-orange-700 mt-2">
        <div className="space-y-2">
          {lowStockProducts.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Package className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">
                    {product.categories?.name || "Chưa phân loại"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Badge
                  variant={
                    (product.stock_quantity || 0) <= 5
                      ? "destructive"
                      : "secondary"
                  }
                  className="text-xs"
                >
                  Còn {product.stock_quantity}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                  onClick={() => handleQuickRestock(product.name)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Nhập thêm
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Show more button if there are more low stock products */}
        {products.filter((product) => {
          const stock = product.stock_quantity || 0;
          const threshold = product.low_stock_threshold || 10;
          return stock > 0 && stock <= threshold;
        }).length > 5 && (
          <div className="mt-3 pt-3 border-t border-orange-200">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              Xem tất cả{" "}
              {
                products.filter((product) => {
                  const stock = product.stock_quantity || 0;
                  const threshold = product.low_stock_threshold || 10;
                  return stock > 0 && stock <= threshold;
                }).length
              }{" "}
              sản phẩm sắp hết hàng
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}
