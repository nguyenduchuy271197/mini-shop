import {
  FileText,
  Scale,
  ShieldCheck,
  AlertTriangle,
  User,
  CreditCard,
  Truck,
  Gavel,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TermsPage() {
  const sections = [
    {
      title: "Định nghĩa và giải thích",
      icon: FileText,
      content: [
        '"Mini Shop" hoặc "chúng tôi" là Công ty TNHH Mini Shop với địa chỉ tại 123 Đường ABC, Quận 1, TP.HCM',
        '"Khách hàng" hoặc "bạn" là người sử dụng dịch vụ của Mini Shop',
        '"Dịch vụ" bao gồm website, ứng dụng di động và tất cả dịch vụ liên quan',
        '"Sản phẩm" là hàng hóa được bán trên nền tảng Mini Shop',
        '"Đơn hàng" là yêu cầu mua hàng được xác nhận bởi khách hàng',
      ],
    },
    {
      title: "Điều kiện sử dụng dịch vụ",
      icon: User,
      content: [
        "Bạn phải từ 16 tuổi trở lên để sử dụng dịch vụ",
        "Thông tin đăng ký phải chính xác và cập nhật",
        "Mỗi người chỉ được tạo một tài khoản",
        "Không được sử dụng dịch vụ cho mục đích bất hợp pháp",
        "Tuân thủ mọi quy định pháp luật hiện hành",
      ],
    },
    {
      title: "Quy định về đặt hàng",
      icon: Truck,
      content: [
        "Đơn hàng chỉ được xác nhận sau khi thanh toán thành công",
        "Giá sản phẩm có thể thay đổi mà không cần báo trước",
        "Mini Shop có quyền từ chối hoặc hủy đơn hàng trong một số trường hợp",
        "Thông tin đơn hàng phải chính xác và đầy đủ",
        "Khách hàng chịu trách nhiệm về việc cung cấp địa chỉ giao hàng",
      ],
    },
    {
      title: "Thanh toán và hoàn tiền",
      icon: CreditCard,
      content: [
        "Hỗ trợ các hình thức thanh toán: COD, chuyển khoản, ví điện tử",
        "Thông tin thanh toán phải chính xác và hợp lệ",
        "Hoàn tiền theo chính sách đổi trả đã công bố",
        "Thời gian hoàn tiền từ 3-7 ngày làm việc",
        "Phí giao dịch (nếu có) do khách hàng chịu",
      ],
    },
    {
      title: "Trách nhiệm của khách hàng",
      icon: ShieldCheck,
      content: [
        "Bảo mật thông tin đăng nhập tài khoản",
        "Sử dụng dịch vụ đúng mục đích và hợp pháp",
        "Cung cấp thông tin chính xác khi đăng ký và đặt hàng",
        "Thanh toán đầy đủ và đúng hạn",
        "Tuân thủ các quy định về đổi trả sản phẩm",
      ],
    },
    {
      title: "Trách nhiệm của Mini Shop",
      icon: Scale,
      content: [
        "Cung cấp thông tin sản phẩm chính xác và đầy đủ",
        "Bảo mật thông tin cá nhân của khách hàng",
        "Xử lý đơn hàng và giao hàng đúng cam kết",
        "Hỗ trợ khách hàng khi có vấn đề phát sinh",
        "Tuân thủ các quy định pháp luật về thương mại điện tử",
      ],
    },
  ];

  const prohibitedActivities = [
    "Sử dụng dịch vụ để phân phối malware hoặc virus",
    "Cố gắng hack, phá hoại hệ thống hoặc dữ liệu",
    "Đăng tải nội dung vi phạm pháp luật hoặc bản quyền",
    "Giả mạo danh tính hoặc thông tin cá nhân",
    "Spam hoặc gửi email không mong muốn",
    "Sử dụng dịch vụ để lừa đảo hoặc gian lận",
    "Vi phạm quyền riêng tư của người khác",
  ];

  const limitationTerms = [
    "Mini Shop không chịu trách nhiệm về thiệt hại gián tiếp, ngẫu nhiên",
    "Trách nhiệm tối đa bằng giá trị đơn hàng gây ra thiệt hại",
    "Không bảo đảm website hoạt động liên tục 100%",
    "Không chịu trách nhiệm về nội dung từ bên thứ ba",
    "Miễn trừ trách nhiệm do sự kiện bất khả kháng",
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-12">
        <Scale className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-4">Điều khoản dịch vụ</h1>
        <p className="text-lg text-muted-foreground">
          Các điều khoản và điều kiện sử dụng dịch vụ của Mini Shop
        </p>
        <div className="mt-4 text-sm text-muted-foreground">
          Cập nhật lần cuối: 15/01/2024
        </div>
      </div>

      {/* Introduction */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <p className="text-muted-foreground leading-relaxed">
            Bằng cách truy cập và sử dụng website hoặc dịch vụ của Mini Shop,
            bạn đồng ý tuân thủ và bị ràng buộc bởi các điều khoản và điều kiện
            sau đây. Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng
            không sử dụng dịch vụ của chúng tôi.
          </p>
        </CardContent>
      </Card>

      {/* Main Sections */}
      <div className="space-y-8">
        {sections.map((section, index) => {
          const IconComponent = section.icon;
          return (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconComponent className="h-5 w-5 text-primary" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {section.content.map((item, itemIndex) => (
                    <li
                      key={itemIndex}
                      className="flex items-start gap-2 text-sm"
                    >
                      <span className="text-primary mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Prohibited Activities */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Các hoạt động bị cấm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Khi sử dụng dịch vụ của chúng tôi, bạn không được thực hiện các hoạt
            động sau:
          </p>
          <ul className="space-y-2">
            {prohibitedActivities.map((activity, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-red-500 mt-1">•</span>
                <span>{activity}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Intellectual Property */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quyền sở hữu trí tuệ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Nội dung của Mini Shop</h4>
            <p className="text-sm text-muted-foreground">
              Tất cả nội dung trên website bao gồm văn bản, hình ảnh, logo,
              thiết kế đều thuộc sở hữu của Mini Shop và được bảo vệ bởi luật
              bản quyền.
            </p>
          </div>
          <Separator />
          <div>
            <h4 className="font-medium mb-2">Nội dung của khách hàng</h4>
            <p className="text-sm text-muted-foreground">
              Bằng cách đăng tải nội dung (đánh giá, bình luận), bạn cấp cho
              Mini Shop quyền sử dụng nội dung đó cho mục đích vận hành dịch vụ.
            </p>
          </div>
          <Separator />
          <div>
            <h4 className="font-medium mb-2">Thương hiệu của bên thứ ba</h4>
            <p className="text-sm text-muted-foreground">
              Các thương hiệu, logo của bên thứ ba được hiển thị trên website
              thuộc quyền sở hữu của các chủ sở hữu tương ứng.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Limitation of Liability */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gavel className="h-5 w-5 text-amber-600" />
            Giới hạn trách nhiệm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {limitationTerms.map((term, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-amber-600 mt-1">•</span>
                <span>{term}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Account Termination */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Chấm dứt tài khoản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Chấm dứt bởi khách hàng</h4>
            <p className="text-sm text-muted-foreground">
              Bạn có thể đóng tài khoản bất kỳ lúc nào bằng cách liên hệ với bộ
              phận hỗ trợ. Các đơn hàng đang xử lý sẽ được hoàn thành theo quy
              định.
            </p>
          </div>
          <Separator />
          <div>
            <h4 className="font-medium mb-2">Chấm dứt bởi Mini Shop</h4>
            <p className="text-sm text-muted-foreground">
              Chúng tôi có quyền tạm ngừng hoặc đóng tài khoản nếu vi phạm điều
              khoản dịch vụ, có hoạt động gian lận hoặc ảnh hưởng đến hệ thống.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Force Majeure */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Sự kiện bất khả kháng</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Mini Shop không chịu trách nhiệm về việc không thể thực hiện nghĩa
            vụ do các sự kiện bất khả kháng như thiên tai, chiến tranh, dịch
            bệnh, sự cố hệ thống do bên thứ ba, hoặc các quy định pháp luật mới
            có hiệu lực.
          </p>
        </CardContent>
      </Card>

      {/* Governing Law */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Luật áp dụng và giải quyết tranh chấp</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Luật áp dụng</h4>
            <p className="text-sm text-muted-foreground">
              Điều khoản này được điều chỉnh bởi pháp luật Việt Nam.
            </p>
          </div>
          <Separator />
          <div>
            <h4 className="font-medium mb-2">Giải quyết tranh chấp</h4>
            <p className="text-sm text-muted-foreground">
              Mọi tranh chấp sẽ được giải quyết thông qua thương lượng. Nếu
              không thành, sẽ được đưa ra Tòa án có thẩm quyền tại TP. Hồ Chí
              Minh.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Updates */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Thay đổi điều khoản</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Mini Shop có quyền sửa đổi hoặc cập nhật điều khoản dịch vụ này bất
            kỳ lúc nào. Phiên bản mới sẽ có hiệu lực sau 30 ngày kể từ ngày công
            bố trên website.
          </p>
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Lưu ý:</strong> Việc tiếp tục sử dụng dịch vụ sau khi có
              thay đổi được coi là bạn đã chấp nhận điều khoản mới.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Thông tin liên hệ</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Nếu bạn có câu hỏi về điều khoản dịch vụ này, vui lòng liên hệ:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-1">Email pháp lý</h4>
              <p className="text-sm text-muted-foreground">legal@minishop.vn</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Hotline</h4>
              <p className="text-sm text-muted-foreground">1900 1234</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Địa chỉ</h4>
              <p className="text-sm text-muted-foreground">
                123 Đường ABC, Quận 1, TP.HCM
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Giờ làm việc</h4>
              <p className="text-sm text-muted-foreground">
                8:00 - 17:00 (T2-T6)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
