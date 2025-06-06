import Link from "next/link";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    shop: [
      { href: "/products", label: "Tất cả sản phẩm" },
      { href: "/categories", label: "Danh mục" },
      { href: "/products?featured=true", label: "Sản phẩm nổi bật" },
      { href: "/products?sale=true", label: "Khuyến mại" },
    ],
    support: [
      { href: "/contact", label: "Liên hệ" },
      { href: "/faq", label: "Câu hỏi thường gặp" },
      { href: "/shipping", label: "Chính sách giao hàng" },
      { href: "/returns", label: "Đổi trả" },
    ],
    company: [
      { href: "/about", label: "Giới thiệu" },
      { href: "/careers", label: "Tuyển dụng" },
      { href: "/privacy", label: "Chính sách bảo mật" },
      { href: "/terms", label: "Điều khoản dịch vụ" },
    ],
  };

  const socialLinks = [
    { href: "https://facebook.com", label: "Facebook", icon: Facebook },
    { href: "https://instagram.com", label: "Instagram", icon: Instagram },
    { href: "https://twitter.com", label: "Twitter", icon: Twitter },
    { href: "https://youtube.com", label: "Youtube", icon: Youtube },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">MS</span>
              </div>
              <span className="font-bold text-xl text-white">Mini Shop</span>
            </Link>
            <p className="text-sm text-gray-400">
              Cửa hàng thương mại điện tử uy tín với nhiều sản phẩm chất lượng
              cao, phục vụ nhu cầu mua sắm của khách hàng Việt Nam.
            </p>

            {/* Contact Info */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>123 Đường ABC, Quận 1, TP.HCM</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>1900 1234</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>contact@minishop.vn</span>
              </div>
            </div>
          </div>

          {/* Shop Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Cửa hàng</h3>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Hỗ trợ</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Công ty</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Social Links */}
            <div className="pt-4">
              <h4 className="font-medium text-white mb-3">
                Theo dõi chúng tôi
              </h4>
              <div className="flex space-x-3">
                {socialLinks.map((social) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={social.href}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary transition-colors"
                    >
                      <IconComponent className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              © {currentYear} Mini Shop. Tất cả quyền được bảo lưu.
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <Link
                href="/privacy"
                className="hover:text-white transition-colors"
              >
                Chính sách bảo mật
              </Link>
              <Link
                href="/terms"
                className="hover:text-white transition-colors"
              >
                Điều khoản sử dụng
              </Link>
              <Link
                href="/sitemap"
                className="hover:text-white transition-colors"
              >
                Sơ đồ trang web
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
