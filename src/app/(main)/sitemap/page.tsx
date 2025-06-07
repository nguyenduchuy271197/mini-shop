import {
  Globe,
  Home,
  Package,
  Users,
  ShoppingCart,
  Settings,
  HelpCircle,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function SitemapPage() {
  const siteStructure = [
    {
      title: "Trang chủ",
      icon: Home,
      links: [
        { title: "Trang chủ", href: "/" },
        { title: "Sản phẩm nổi bật", href: "/?featured=true" },
        { title: "Khuyến mại", href: "/?sale=true" },
      ],
    },
    {
      title: "Sản phẩm",
      icon: Package,
      links: [
        { title: "Tất cả sản phẩm", href: "/products" },
        { title: "Danh mục sản phẩm", href: "/categories" },
        { title: "Tìm kiếm sản phẩm", href: "/products?search=" },
        { title: "Sản phẩm giảm giá", href: "/products?sale=true" },
        { title: "Sản phẩm mới", href: "/products?new=true" },
      ],
    },
    {
      title: "Tài khoản",
      icon: Users,
      links: [
        { title: "Đăng nhập", href: "/auth/login" },
        { title: "Đăng ký", href: "/auth/register" },
        { title: "Quên mật khẩu", href: "/auth/forgot-password" },
        { title: "Hồ sơ cá nhân", href: "/dashboard/profile" },
        { title: "Đổi mật khẩu", href: "/dashboard/change-password" },
      ],
    },
    {
      title: "Mua sắm",
      icon: ShoppingCart,
      links: [
        { title: "Giỏ hàng", href: "/cart" },
        { title: "Thanh toán", href: "/checkout" },
        { title: "Lịch sử đơn hàng", href: "/orders" },
        { title: "Theo dõi đơn hàng", href: "/orders/track" },
        { title: "Yêu thích", href: "/dashboard/wishlist" },
      ],
    },
    {
      title: "Hỗ trợ khách hàng",
      icon: HelpCircle,
      links: [
        { title: "Liên hệ", href: "/contact" },
        { title: "Câu hỏi thường gặp", href: "/faq" },
        { title: "Hướng dẫn mua hàng", href: "/help/shopping-guide" },
        { title: "Hướng dẫn thanh toán", href: "/help/payment-guide" },
        { title: "Báo cáo vấn đề", href: "/help/report-issue" },
      ],
    },
    {
      title: "Chính sách",
      icon: FileText,
      links: [
        { title: "Chính sách giao hàng", href: "/shipping" },
        { title: "Chính sách đổi trả", href: "/returns" },
        { title: "Chính sách bảo mật", href: "/privacy" },
        { title: "Điều khoản dịch vụ", href: "/terms" },
        { title: "Chính sách bảo hành", href: "/warranty" },
      ],
    },
    {
      title: "Công ty",
      icon: Settings,
      links: [
        { title: "Giới thiệu", href: "/about" },
        { title: "Tuyển dụng", href: "/careers" },
        { title: "Tin tức", href: "/news" },
        { title: "Thông cáo báo chí", href: "/press" },
        { title: "Quan hệ nhà đầu tư", href: "/investor-relations" },
      ],
    },
    {
      title: "Quản trị (Admin)",
      icon: Settings,
      links: [
        { title: "Dashboard", href: "/admin" },
        { title: "Quản lý sản phẩm", href: "/admin/products" },
        { title: "Quản lý danh mục", href: "/admin/categories" },
        { title: "Quản lý đơn hàng", href: "/admin/orders" },
        { title: "Quản lý khách hàng", href: "/admin/customers" },
        { title: "Quản lý đánh giá", href: "/admin/reviews" },
        { title: "Quản lý banner", href: "/admin/banners" },
        { title: "Báo cáo", href: "/admin/reports" },
        { title: "Cài đặt", href: "/admin/settings" },
      ],
    },
  ];

  const popularPages = [
    { title: "Điện thoại & Tablet", href: "/categories/phones-tablets" },
    { title: "Laptop & Máy tính", href: "/categories/computers" },
    { title: "Thời trang Nam", href: "/categories/mens-fashion" },
    { title: "Thời trang Nữ", href: "/categories/womens-fashion" },
    { title: "Nhà cửa & Đời sống", href: "/categories/home-living" },
    { title: "Sách & Văn phòng phẩm", href: "/categories/books-stationery" },
    { title: "Thể thao & Du lịch", href: "/categories/sports-travel" },
    { title: "Sức khỏe & Làm đẹp", href: "/categories/health-beauty" },
  ];

  const quickLinks = [
    { title: "Flash Sale", href: "/flash-sale" },
    { title: "Voucher", href: "/vouchers" },
    { title: "Xu hướng mua sắm", href: "/trending" },
    { title: "Thương hiệu", href: "/brands" },
    { title: "Mall", href: "/mall" },
    { title: "Live Chat", href: "/chat" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-12">
        <Globe className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-4">Sơ đồ trang web</h1>
        <p className="text-lg text-muted-foreground">
          Khám phá tất cả các trang và tính năng có sẵn trên Mini Shop
        </p>
      </div>

      {/* Popular Categories */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Danh mục phổ biến</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {popularPages.map((page, index) => (
              <Link
                key={index}
                href={page.href}
                className="text-sm text-primary hover:text-primary/80 hover:underline"
              >
                {page.title}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Liên kết nhanh</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
            {quickLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="text-sm text-primary hover:text-primary/80 hover:underline"
              >
                {link.title}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Site Structure */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {siteStructure.map((section, index) => {
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
                <div className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <Link
                      key={linkIndex}
                      href={link.href}
                      className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.title}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* SEO Information */}
      <Card className="mt-12">
        <CardHeader>
          <CardTitle>Thông tin SEO</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium mb-2">Tổng số trang</h4>
            <p className="text-2xl font-bold text-primary">50+</p>
            <p className="text-sm text-muted-foreground">Trang và chức năng</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Cập nhật lần cuối</h4>
            <p className="text-sm text-muted-foreground">15/01/2024</p>
            <p className="text-sm text-muted-foreground">Cập nhật hàng ngày</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Tình trạng</h4>
            <p className="text-sm text-green-600">✓ Tất cả trang hoạt động</p>
            <p className="text-sm text-muted-foreground">Kiểm tra 24/7</p>
          </div>
        </CardContent>
      </Card>

      {/* XML Sitemap */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>XML Sitemap</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Dành cho công cụ tìm kiếm và SEO. Tự động cập nhật khi có thay đổi.
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <code className="text-sm">https://minishop.vn/sitemap.xml</code>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Cần hỗ trợ?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Không tìm thấy trang bạn cần? Liên hệ với chúng tôi để được hỗ trợ.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/contact"
              className="text-sm text-primary hover:text-primary/80 hover:underline"
            >
              → Liên hệ hỗ trợ
            </Link>
            <Link
              href="/faq"
              className="text-sm text-primary hover:text-primary/80 hover:underline"
            >
              → Câu hỏi thường gặp
            </Link>
            <Link
              href="/help"
              className="text-sm text-primary hover:text-primary/80 hover:underline"
            >
              → Trung tâm trợ giúp
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Footer Note */}
      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          Sơ đồ trang web này được cập nhật thường xuyên để phản ánh cấu trúc
          hiện tại của Mini Shop.
          <br />
          Một số trang có thể yêu cầu đăng nhập hoặc quyền truy cập đặc biệt.
        </p>
      </div>
    </div>
  );
}
