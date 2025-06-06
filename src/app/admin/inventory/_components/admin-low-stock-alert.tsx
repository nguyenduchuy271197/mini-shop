import { createClient } from "@/lib/supabase/server";
import { AlertTriangle, Package } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export async function AdminLowStockAlert() {
  const supabase = createClient();

  // Get low stock products
  const { data: lowStockProducts, error } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      slug,
      stock_quantity,
      price,
      categories (
        name
      )
    `
    )
    .eq("is_active", true)
    .lt("stock_quantity", 10)
    .gt("stock_quantity", 0)
    .order("stock_quantity", { ascending: true })
    .limit(5);

  if (error || !lowStockProducts || lowStockProducts.length === 0) {
    return null;
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
              className="flex items-center justify-between p-2 bg-white rounded border border-orange-200"
            >
              <div className="flex items-center space-x-3">
                <Package className="h-4 w-4 text-gray-400" />
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
                    product.stock_quantity <= 5 ? "destructive" : "secondary"
                  }
                  className="text-xs"
                >
                  Còn {product.stock_quantity}
                </Badge>
                <Button size="sm" variant="outline">
                  Nhập thêm
                </Button>
              </div>
            </div>
          ))}
        </div>

        {lowStockProducts.length >= 5 && (
          <div className="mt-3 pt-3 border-t border-orange-200">
            <Button variant="outline" size="sm" className="w-full">
              Xem tất cả sản phẩm sắp hết hàng
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}
