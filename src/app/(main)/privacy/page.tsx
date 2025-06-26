import {
  Shield,
  Eye,
  Lock,
  Database,
  Users,
  FileText,
  AlertTriangle,
  Mail,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chính sách bảo mật",
  description:
    "Chính sách bảo mật thông tin khách hàng của Minishop. Tìm hiểu cách chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn.",
  keywords:
    "chính sách bảo mật, bảo vệ thông tin, quyền riêng tư, an toàn dữ liệu",
  openGraph: {
    title: "Chính sách bảo mật | Minishop",
    description: "Chính sách bảo mật thông tin khách hàng của Minishop",
    url: "/privacy",
    images: [
      {
        url: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200&h=630&fit=crop",
        width: 1200,
        height: 630,
        alt: "Chính sách bảo mật Minishop",
      },
    ],
  },
};

export default function PrivacyPage() {
  const sections = [
    {
      title: "Thông tin chúng tôi thu thập",
      icon: Database,
      content: [
        "Thông tin cá nhân: Họ tên, địa chỉ email, số điện thoại, địa chỉ giao hàng",
        "Thông tin thanh toán: Thông tin thẻ tín dụng, tài khoản ngân hàng (được mã hóa)",
        "Thông tin đăng nhập: Tên đăng nhập, mật khẩu (được băm)",
        "Thông tin thiết bị: IP address, loại trình duyệt, thông tin thiết bị",
        "Dữ liệu sử dụng: Lịch sử duyệt web, tương tác với sản phẩm, cookie",
      ],
    },
    {
      title: "Mục đích sử dụng thông tin",
      icon: Eye,
      content: [
        "Xử lý đơn hàng và cung cấp dịch vụ khách hàng",
        "Gửi thông báo về đơn hàng và cập nhật tài khoản",
        "Cải thiện sản phẩm và trải nghiệm người dùng",
        "Gửi thông tin marketing (chỉ khi đã đồng ý)",
        "Phân tích dữ liệu để tối ưu hóa website",
        "Tuân thủ các nghĩa vụ pháp lý",
      ],
    },
    {
      title: "Chia sẻ thông tin",
      icon: Users,
      content: [
        "Đối tác vận chuyển: Để giao hàng đến khách hàng",
        "Nhà cung cấp thanh toán: Để xử lý giao dịch",
        "Đối tác dịch vụ: Để hỗ trợ vận hành website",
        "Cơ quan pháp luật: Khi có yêu cầu hợp pháp",
        "Không bán thông tin cá nhân cho bên thứ ba để marketing",
      ],
    },
    {
      title: "Bảo mật thông tin",
      icon: Lock,
      content: [
        "Mã hóa SSL/TLS cho tất cả dữ liệu truyền tải",
        "Lưu trữ dữ liệu trên server bảo mật với kiểm soát truy cập",
        "Thường xuyên cập nhật và patch hệ thống bảo mật",
        "Đào tạo nhân viên về bảo mật thông tin",
        "Kiểm tra bảo mật định kỳ bởi bên thứ ba",
        "Phát hiện và ứng phó sự cố bảo mật 24/7",
      ],
    },
    {
      title: "Quyền của khách hàng",
      icon: Shield,
      content: [
        "Truy cập và xem thông tin cá nhân được lưu trữ",
        "Yêu cầu chỉnh sửa hoặc cập nhật thông tin",
        "Yêu cầu xóa tài khoản và dữ liệu cá nhân",
        "Rút lại sự đồng ý xử lý dữ liệu bất kỳ lúc nào",
        "Từ chối nhận email marketing",
        "Khiếu nại về việc xử lý dữ liệu cá nhân",
      ],
    },
    {
      title: "Cookie và tracking",
      icon: FileText,
      content: [
        "Cookie cần thiết: Để website hoạt động bình thường",
        "Cookie phân tích: Để hiểu cách sử dụng website",
        "Cookie marketing: Để hiển thị quảng cáo phù hợp",
        "Bạn có thể tắt cookie trong cài đặt trình duyệt",
        "Một số tính năng có thể không hoạt động khi tắt cookie",
      ],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-12">
        <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-4">Chính sách bảo mật</h1>
        <p className="text-lg text-muted-foreground">
          Mini Shop cam kết bảo vệ quyền riêng tư và thông tin cá nhân của khách
          hàng
        </p>
        <div className="mt-4 text-sm text-muted-foreground">
          Cập nhật lần cuối: 15/01/2024
        </div>
      </div>

      {/* Introduction */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <p className="text-muted-foreground leading-relaxed">
            Chính sách bảo mật này mô tả cách Mini Shop thu thập, sử dụng, lưu
            trữ và bảo vệ thông tin cá nhân của bạn khi sử dụng website và dịch
            vụ của chúng tôi. Bằng cách sử dụng dịch vụ, bạn đồng ý với các điều
            khoản trong chính sách này.
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

      {/* Data Retention */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Thời gian lưu trữ dữ liệu
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Thông tin tài khoản</h4>
            <p className="text-sm text-muted-foreground">
              Lưu trữ trong suốt thời gian tài khoản tồn tại và 2 năm sau khi
              đóng tài khoản
            </p>
          </div>
          <Separator />
          <div>
            <h4 className="font-medium mb-2">Lịch sử đơn hàng</h4>
            <p className="text-sm text-muted-foreground">
              Lưu trữ tối thiểu 5 năm để tuân thủ quy định pháp luật về kế toán
              và thuế
            </p>
          </div>
          <Separator />
          <div>
            <h4 className="font-medium mb-2">Dữ liệu marketing</h4>
            <p className="text-sm text-muted-foreground">
              Xóa ngay lập tức khi khách hàng từ chối nhận email marketing
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Third Party Services */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Dịch vụ bên thứ ba</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Google Analytics</h4>
            <p className="text-sm text-muted-foreground">
              Để phân tích lưu lượng website và cải thiện trải nghiệm người dùng
            </p>
          </div>
          <Separator />
          <div>
            <h4 className="font-medium mb-2">Facebook Pixel</h4>
            <p className="text-sm text-muted-foreground">
              Để tối ưu hóa quảng cáo và đo lường hiệu quả marketing
            </p>
          </div>
          <Separator />
          <div>
            <h4 className="font-medium mb-2">Nhà cung cấp thanh toán</h4>
            <p className="text-sm text-muted-foreground">
              VNPay, MoMo, ZaloPay để xử lý giao dịch thanh toán an toàn
            </p>
          </div>
        </CardContent>
      </Card>

      {/* International Transfer */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Chuyển giao dữ liệu quốc tế
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Một số dữ liệu có thể được xử lý trên server đặt tại nước ngoài (như
            cloud services). Chúng tôi đảm bảo các nhà cung cấp này tuân thủ
            tiêu chuẩn bảo mật quốc tế và có các biện pháp bảo vệ dữ liệu phù
            hợp.
          </p>
        </CardContent>
      </Card>

      {/* Children Privacy */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quyền riêng tư trẻ em</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Dịch vụ của chúng tôi không nhắm đến trẻ em dưới 16 tuổi. Chúng tôi
            không cố ý thu thập thông tin cá nhân từ trẻ em dưới 16 tuổi. Nếu
            phát hiện điều này, chúng tôi sẽ xóa thông tin đó ngay lập tức.
          </p>
        </CardContent>
      </Card>

      {/* Updates */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Cập nhật chính sách</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian.
            Những thay đổi quan trọng sẽ được thông báo qua email hoặc thông báo
            trên website trước khi có hiệu lực.
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm">
              <strong>Lời khuyên:</strong> Hãy thường xuyên xem lại chính sách
              này để cập nhật những thay đổi mới nhất.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Liên hệ về bảo mật
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Nếu bạn có câu hỏi về chính sách bảo mật hoặc muốn thực hiện quyền
            của mình, hãy liên hệ với chúng tôi:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-1">Email bảo mật</h4>
              <p className="text-sm text-muted-foreground">
                privacy@minishop.vn
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Hotline</h4>
              <p className="text-sm text-muted-foreground">
                1900 1234 (ext. 3)
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Địa chỉ</h4>
              <p className="text-sm text-muted-foreground">
                123 Đường ABC, Quận 1, TP.HCM
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Thời gian phản hồi</h4>
              <p className="text-sm text-muted-foreground">
                Trong vòng 30 ngày
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
