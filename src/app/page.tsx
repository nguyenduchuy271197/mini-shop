import Link from "next/link";
import Navigation from "@/components/shared/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  Star,
  Truck,
  Shield,
  RefreshCw,
  ArrowRight,
  Users,
  Award,
  Heart,
} from "lucide-react";

export default function HomePage() {
  const features = [
    {
      icon: <Truck className="h-8 w-8 text-blue-600" />,
      title: "Giao hàng miễn phí",
      description: "Miễn phí vận chuyển cho đơn hàng từ 500.000đ",
    },
    {
      icon: <Shield className="h-8 w-8 text-green-600" />,
      title: "Thanh toán an toàn",
      description: "Bảo mật thông tin thanh toán 100%",
    },
    {
      icon: <RefreshCw className="h-8 w-8 text-orange-600" />,
      title: "Đổi trả dễ dàng",
      description: "Đổi trả trong vòng 30 ngày miễn phí",
    },
    {
      icon: <Award className="h-8 w-8 text-purple-600" />,
      title: "Chất lượng đảm bảo",
      description: "Sản phẩm chính hãng 100%",
    },
  ];

  const stats = [
    { number: "10K+", label: "Khách hàng hài lòng" },
    { number: "500+", label: "Sản phẩm chất lượng" },
    { number: "50+", label: "Thương hiệu uy tín" },
    { number: "24/7", label: "Hỗ trợ khách hàng" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <Badge className="mb-4 bg-blue-500/20 text-blue-100 border-blue-400">
              🎉 Khuyến mãi đặc biệt - Giảm giá lên đến 50%
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Chào mừng đến với
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                Mini Shop
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Khám phá hàng ngàn sản phẩm chất lượng cao với giá cả hợp lý. Mua
              sắm dễ dàng, giao hàng nhanh chóng!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Khám phá ngay
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600"
              >
                Tìm hiểu thêm
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tại sao chọn Mini Shop?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Chúng tôi cam kết mang đến trải nghiệm mua sắm tuyệt vời nhất cho
              khách hàng
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="mx-auto mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <Users className="h-16 w-16 mx-auto mb-6 text-indigo-200" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Tham gia cộng đồng Mini Shop
          </h2>
          <p className="text-xl mb-8 text-indigo-100">
            Đăng ký tài khoản để nhận ưu đãi đặc biệt và cập nhật những sản phẩm
            mới nhất
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-indigo-600 hover:bg-gray-100"
              asChild
            >
              <Link href="/auth/register">
                Đăng ký miễn phí
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-indigo-600"
              asChild
            >
              <Link href="/auth/login">Đăng nhập</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <ShoppingBag className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold">Mini Shop</span>
              </div>
              <p className="text-gray-300 mb-4 max-w-md">
                Cửa hàng trực tuyến hàng đầu với hàng ngàn sản phẩm chất lượng
                cao. Mua sắm an toàn, giao hàng nhanh chóng!
              </p>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="text-sm">4.8/5 đánh giá</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-red-400 fill-current" />
                  <span className="text-sm">10K+ yêu thích</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Liên kết nhanh</h3>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <Link href="/products" className="hover:text-white">
                    Sản phẩm
                  </Link>
                </li>
                <li>
                  <Link href="/categories" className="hover:text-white">
                    Danh mục
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white">
                    Về chúng tôi
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Liên hệ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Hỗ trợ</h3>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <Link href="/help" className="hover:text-white">
                    Trung tâm trợ giúp
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="hover:text-white">
                    Chính sách vận chuyển
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="hover:text-white">
                    Đổi trả
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Chính sách bảo mật
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Mini Shop. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
