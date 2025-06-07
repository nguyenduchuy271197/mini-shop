import {
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Phone,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function ReturnsPage() {
  const returnConditions = [
    {
      icon: CheckCircle,
      title: "Sản phẩm đủ điều kiện đổi trả",
      items: [
        "Sản phẩm còn nguyên vẹn, chưa qua sử dụng",
        "Còn đầy đủ nhãn mác, tem niêm phong",
        "Có hóa đơn mua hàng hoặc email xác nhận",
        "Trong thời hạn 7 ngày kể từ ngày nhận hàng",
        "Sản phẩm không thuộc danh sách loại trừ",
      ],
      color: "text-green-600",
    },
    {
      icon: XCircle,
      title: "Sản phẩm không được đổi trả",
      items: [
        "Sản phẩm giảm giá trên 50%",
        "Đồ lót, quần áo bơi",
        "Mỹ phẩm, nước hoa đã mở seal",
        "Thực phẩm, đồ uống",
        "Sản phẩm điện tử đã kích hoạt",
        "Sản phẩm được làm theo yêu cầu riêng",
      ],
      color: "text-red-600",
    },
  ];

  const returnProcess = [
    {
      step: 1,
      title: "Liên hệ yêu cầu đổi trả",
      description: "Gọi hotline hoặc gửi yêu cầu qua email/website",
      time: "Ngay lập tức",
    },
    {
      step: 2,
      title: "Xác nhận điều kiện",
      description: "Kiểm tra điều kiện sản phẩm và thời hạn đổi trả",
      time: "30 phút - 2 giờ",
    },
    {
      step: 3,
      title: "Gửi sản phẩm về",
      description: "Đóng gói và gửi sản phẩm về kho Mini Shop",
      time: "1-3 ngày",
    },
    {
      step: 4,
      title: "Kiểm tra sản phẩm",
      description: "Kiểm tra tình trạng sản phẩm và xác nhận đổi trả",
      time: "1-2 ngày",
    },
    {
      step: 5,
      title: "Xử lý đổi trả",
      description: "Hoàn tiền hoặc gửi sản phẩm thay thế",
      time: "2-5 ngày",
    },
  ];

  const refundMethods = [
    {
      method: "Hoàn tiền về tài khoản ngân hàng",
      time: "3-7 ngày làm việc",
      note: "Cho thanh toán chuyển khoản",
    },
    {
      method: "Hoàn tiền về ví điện tử",
      time: "1-3 ngày làm việc",
      note: "Cho thanh toán MoMo, ZaloPay",
    },
    {
      method: "Hoàn tiền mặt",
      time: "Ngay khi nhận hàng",
      note: "Cho đơn hàng COD (tại kho)",
    },
    {
      method: "Voucher/Credit",
      time: "Ngay lập tức",
      note: "Có thể sử dụng cho đơn hàng tiếp theo",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-12">
        <RefreshCw className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-4">Chính sách đổi trả</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Mini Shop cam kết đổi trả dễ dàng trong vòng 7 ngày với các điều kiện
          rõ ràng
        </p>
      </div>

      {/* Return Conditions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {returnConditions.map((condition, index) => {
          const IconComponent = condition.icon;
          return (
            <Card key={index}>
              <CardHeader>
                <CardTitle
                  className={`flex items-center gap-2 ${condition.color}`}
                >
                  <IconComponent className="h-5 w-5" />
                  {condition.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {condition.items.map((item, itemIndex) => (
                    <li
                      key={itemIndex}
                      className="flex items-start gap-2 text-sm"
                    >
                      <span className="text-muted-foreground mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Return Process */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Quy trình đổi trả
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {returnProcess.map((step, index) => (
              <div key={step.step} className="text-center">
                <div className="relative">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold mb-3 mx-auto">
                    {step.step}
                  </div>
                  {index < returnProcess.length - 1 && (
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

      {/* Refund Methods */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle>Hình thức hoàn tiền</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {refundMethods.map((method, index) => (
              <div key={index}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{method.method}</h4>
                    <p className="text-sm text-muted-foreground">
                      {method.note}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {method.time}
                  </Badge>
                </div>
                {index < refundMethods.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Lưu ý quan trọng
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <strong>• Phí vận chuyển:</strong> Khách hàng chịu phí gửi hàng về
              kho (trừ lỗi từ nhà bán)
            </div>
            <div className="text-sm">
              <strong>• Kiểm tra kỹ:</strong> Sản phẩm sẽ được kiểm tra kỹ trước
              khi hoàn tiền
            </div>
            <div className="text-sm">
              <strong>• Thời hạn:</strong> Tính từ ngày nhận hàng, không phải
              ngày đặt hàng
            </div>
            <div className="text-sm">
              <strong>• Bảo hành:</strong> Sản phẩm lỗi có thể bảo hành thay vì
              đổi trả
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Hỗ trợ đổi trả
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm">
              <strong>Hotline:</strong> 1900 1234 (8:00 - 21:00)
            </div>
            <div className="text-sm">
              <strong>Email:</strong> returns@minishop.vn
            </div>
            <div className="text-sm">
              <strong>Địa chỉ gửi hàng:</strong>
              <br />
              Kho Mini Shop
              <br />
              123 Đường ABC, Quận 1, TP.HCM
            </div>
            <Button className="w-full">Yêu cầu đổi trả ngay</Button>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <Card className="mt-12">
        <CardHeader>
          <CardTitle>Câu hỏi thường gặp về đổi trả</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Q: Tôi có thể đổi size không?</h4>
            <p className="text-sm text-muted-foreground">
              A: Có, bạn có thể đổi size miễn phí trong vòng 7 ngày với điều
              kiện sản phẩm chưa qua sử dụng.
            </p>
          </div>
          <Separator />
          <div>
            <h4 className="font-medium mb-2">
              Q: Sản phẩm tặng có được đổi trả không?
            </h4>
            <p className="text-sm text-muted-foreground">
              A: Sản phẩm tặng kèm không được đổi trả riêng, chỉ có thể đổi trả
              cùng sản phẩm chính.
            </p>
          </div>
          <Separator />
          <div>
            <h4 className="font-medium mb-2">Q: Tôi bị mất hóa đơn thì sao?</h4>
            <p className="text-sm text-muted-foreground">
              A: Bạn có thể sử dụng email xác nhận đơn hàng hoặc liên hệ hotline
              để tra cứu thông tin.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
