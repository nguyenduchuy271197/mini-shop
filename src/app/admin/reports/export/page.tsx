import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, BarChart3, Package } from "lucide-react";

export default function ExportReportsPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Xuất Báo Cáo</h1>
        <p className="text-gray-600 mt-2">
          Xuất báo cáo doanh thu và đơn hàng ra file Excel/PDF
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Xuất Báo Cáo Doanh Thu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Xuất báo cáo doanh thu chi tiết theo khoảng thời gian
            </p>
            <div className="flex gap-2">
              <Button variant="outline" disabled>
                <FileText className="mr-2 h-4 w-4" />
                Excel
              </Button>
              <Button variant="outline" disabled>
                <Download className="mr-2 h-4 w-4" />
                PDF
              </Button>
            </div>
            <p className="text-xs text-amber-600">
              Tính năng đang được phát triển
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Xuất Báo Cáo Sản Phẩm
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Xuất báo cáo sản phẩm bán chạy và thống kê
            </p>
            <div className="flex gap-2">
              <Button variant="outline" disabled>
                <FileText className="mr-2 h-4 w-4" />
                Excel
              </Button>
              <Button variant="outline" disabled>
                <Download className="mr-2 h-4 w-4" />
                PDF
              </Button>
            </div>
            <p className="text-xs text-amber-600">
              Tính năng đang được phát triển
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Ghi Chú</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            FR37 - Xuất báo cáo: Tính năng này sẽ cho phép xuất báo cáo doanh
            thu và đơn hàng ra các định dạng Excel và PDF. Hiện tại, bạn có thể
            sử dụng chức năng xuất JSON trong các trang báo cáo riêng lẻ.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
