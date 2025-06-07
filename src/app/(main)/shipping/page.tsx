import {
  Truck,
  Clock,
  MapPin,
  DollarSign,
  Package,
  Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function ShippingPage() {
  const shippingZones = [
    {
      zone: "Nội thành TP.HCM",
      time: "1-2 ngày",
      fee: "25.000đ",
      freeShipping: "500.000đ",
    },
    {
      zone: "Hà Nội và các tỉnh lân cận",
      time: "2-3 ngày",
      fee: "35.000đ",
      freeShipping: "800.000đ",
    },
    {
      zone: "Các tỉnh thành khác",
      time: "3-5 ngày",
      fee: "45.000đ",
      freeShipping: "1.000.000đ",
    },
    {
      zone: "Vùng xa, hải đảo",
      time: "5-7 ngày",
      fee: "Liên hệ",
      freeShipping: "Không áp dụng",
    },
  ];

  const shippingSteps = [
    {
      step: 1,
      title: "Xác nhận đơn hàng",
      description: "Đơn hàng được xác nhận và chuẩn bị đóng gói",
      time: "1-2 giờ",
    },
    {
      step: 2,
      title: "Đóng gói sản phẩm",
      description: "Sản phẩm được đóng gói cẩn thận và dán nhãn vận chuyển",
      time: "2-4 giờ",
    },
    {
      step: 3,
      title: "Bàn giao vận chuyển",
      description: "Đơn hàng được bàn giao cho đơn vị vận chuyển",
      time: "4-6 giờ",
    },
    {
      step: 4,
      title: "Đang vận chuyển",
      description: "Sản phẩm đang được vận chuyển đến địa chỉ của bạn",
      time: "Theo khu vực",
    },
    {
      step: 5,
      title: "Giao hàng thành công",
      description: "Sản phẩm được giao đến tay khách hàng",
      time: "Hoàn thành",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-12">
        <Truck className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-4">Chính sách giao hàng</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Thông tin chi tiết về dịch vụ giao hàng, phí vận chuyển và thời gian
          giao hàng của Mini Shop
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Shipping Zones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Khu vực giao hàng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {shippingZones.map((zone, index) => (
                <div key={index}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{zone.zone}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {zone.time}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {zone.fee}
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Miễn phí từ {zone.freeShipping}
                    </Badge>
                  </div>
                  {index < shippingZones.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Shipping Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Cam kết dịch vụ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium mb-1">Đóng gói cẩn thận</h4>
                  <p className="text-sm text-muted-foreground">
                    Sản phẩm được đóng gói bằng vật liệu chống sốc, đảm bảo an
                    toàn
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium mb-1">Giao hàng đúng hẹn</h4>
                  <p className="text-sm text-muted-foreground">
                    Cam kết giao hàng đúng thời gian đã thông báo
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium mb-1">Bảo hiểm hàng hóa</h4>
                  <p className="text-sm text-muted-foreground">
                    Toàn bộ đơn hàng được bảo hiểm trong quá trình vận chuyển
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium mb-1">Theo dõi đơn hàng</h4>
                  <p className="text-sm text-muted-foreground">
                    Khách hàng có thể theo dõi tình trạng đơn hàng realtime
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shipping Process */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Quy trình giao hàng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {shippingSteps.map((step, index) => (
              <div key={step.step} className="text-center">
                <div className="relative">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold mb-3 mx-auto">
                    {step.step}
                  </div>
                  {index < shippingSteps.length - 1 && (
                    <div className="hidden md:block absolute top-6 -right-8 w-16 h-0.5 bg-muted" />
                  )}
                </div>
                <h3 className="font-medium mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {step.description}
                </p>
                <Badge variant="outline" className="text-xs">
                  {step.time}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Lưu ý quan trọng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <strong>• Thời gian giao hàng:</strong> Không bao gồm thứ 7, chủ
              nhật và ngày lễ
            </div>
            <div className="text-sm">
              <strong>• Giao hàng thất bại:</strong> Sẽ liên hệ khách hàng để
              sắp xếp lại lịch giao
            </div>
            <div className="text-sm">
              <strong>• Kiểm tra hàng:</strong> Khách hàng có quyền kiểm tra sản
              phẩm trước khi nhận
            </div>
            <div className="text-sm">
              <strong>• Thay đổi địa chỉ:</strong> Chỉ có thể thay đổi trước khi
              hàng rời kho
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Liên hệ hỗ trợ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <strong>Hotline:</strong> 1900 1234 (7:30 - 22:00)
            </div>
            <div className="text-sm">
              <strong>Email:</strong> shipping@minishop.vn
            </div>
            <div className="text-sm">
              <strong>Chat:</strong> Hỗ trợ trực tuyến trên website
            </div>
            <div className="text-sm">
              <strong>Fanpage:</strong> facebook.com/minishop.vn
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
