import { Card, CardContent } from "@/components/ui/card";
import {
  Truck,
  Shield,
  RotateCcw,
  Headphones,
  CreditCard,
  Award,
} from "lucide-react";

const benefits = [
  {
    icon: Truck,
    title: "Giao hàng miễn phí",
    description: "Miễn phí giao hàng cho đơn hàng từ 500.000₫ trở lên",
    color: "text-blue-600 bg-blue-100",
  },
  {
    icon: Shield,
    title: "Bảo hành chính hãng",
    description: "Sản phẩm được bảo hành chính hãng từ nhà sản xuất",
    color: "text-green-600 bg-green-100",
  },
  {
    icon: RotateCcw,
    title: "Đổi trả dễ dàng",
    description: "Đổi trả miễn phí trong vòng 30 ngày nếu không hài lòng",
    color: "text-purple-600 bg-purple-100",
  },
  {
    icon: Headphones,
    title: "Hỗ trợ 24/7",
    description: "Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ bạn",
    color: "text-orange-600 bg-orange-100",
  },
  {
    icon: CreditCard,
    title: "Thanh toán an toàn",
    description: "Nhiều phương thức thanh toán bảo mật và tiện lợi",
    color: "text-red-600 bg-red-100",
  },
  {
    icon: Award,
    title: "Chất lượng đảm bảo",
    description: "Chỉ bán những sản phẩm chất lượng cao, được kiểm định",
    color: "text-yellow-600 bg-yellow-100",
  },
];

export default function BenefitsSection() {
  return (
    <div className="container mx-auto px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Tại sao chọn Mini Shop?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Chúng tôi cam kết mang đến trải nghiệm mua sắm tuyệt vời nhất cho
            khách hàng
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <BenefitCard key={index} benefit={benefit} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Sẵn sàng khám phá?
            </h3>
            <p className="text-lg text-blue-100 mb-6 max-w-2xl mx-auto">
              Hãy tham gia cùng hàng ngàn khách hàng đã tin tưởng Mini Shop và
              trải nghiệm dịch vụ tuyệt vời của chúng tôi
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/products"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-full hover:bg-gray-100 transition-colors"
              >
                Khám phá ngay
              </a>
              <a
                href="/auth/register"
                className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-blue-600 transition-colors"
              >
                Đăng ký thành viên
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface BenefitCardProps {
  benefit: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    color: string;
  };
}

function BenefitCard({ benefit }: BenefitCardProps) {
  const IconComponent = benefit.icon;

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-0 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          {/* Icon */}
          <div
            className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${benefit.color} group-hover:scale-110 transition-transform duration-200`}
          >
            <IconComponent className="h-8 w-8" />
          </div>

          {/* Content */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {benefit.title}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {benefit.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
