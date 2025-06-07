import { Heart, Users, Award, Target, Eye, Handshake } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AboutPage() {
  const milestones = [
    {
      year: "2020",
      title: "Thành lập Mini Shop",
      description:
        "Khởi nghiệp với tầm nhìn trở thành nền tảng e-commerce uy tín",
    },
    {
      year: "2021",
      title: "Mở rộng sản phẩm",
      description: "Đa dạng hóa danh mục với hơn 10.000 sản phẩm chất lượng",
    },
    {
      year: "2022",
      title: "Phát triển công nghệ",
      description: "Ra mắt ứng dụng di động và hệ thống thanh toán tiện lợi",
    },
    {
      year: "2023",
      title: "Mở rộng thị trường",
      description:
        "Phục vụ khách hàng trên toàn quốc với dịch vụ giao hàng nhanh",
    },
    {
      year: "2024",
      title: "Đổi mới bền vững",
      description: "Cam kết phát triển bền vững và trách nhiệm xã hội",
    },
  ];

  const values = [
    {
      icon: Heart,
      title: "Tận tâm",
      description: "Luôn đặt khách hàng làm trung tâm trong mọi quyết định",
      color: "text-red-500",
    },
    {
      icon: Handshake,
      title: "Tin cậy",
      description: "Xây dựng lòng tin thông qua chất lượng sản phẩm và dịch vụ",
      color: "text-blue-500",
    },
    {
      icon: Award,
      title: "Chất lượng",
      description: "Cam kết mang đến những sản phẩm chất lượng cao nhất",
      color: "text-yellow-500",
    },
    {
      icon: Users,
      title: "Đồng hành",
      description: "Đồng hành cùng khách hàng trong hành trình mua sắm",
      color: "text-green-500",
    },
  ];

  const stats = [
    { number: "100K+", label: "Khách hàng tin tưởng", icon: Users },
    { number: "50K+", label: "Sản phẩm đa dạng", icon: Award },
    { number: "99%", label: "Tỷ lệ hài lòng", icon: Heart },
    { number: "24/7", label: "Hỗ trợ khách hàng", icon: Handshake },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-6">Về Mini Shop</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Mini Shop được thành lập với sứ mệnh mang đến trải nghiệm mua sắm trực
          tuyến tuyệt vời nhất cho khách hàng Việt Nam thông qua các sản phẩm
          chất lượng và dịch vụ khách hàng xuất sắc.
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              Sứ mệnh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              Chúng tôi cam kết tạo ra một nền tảng thương mại điện tử đáng tin
              cậy, nơi mọi người có thể dễ dàng tìm thấy và mua sắm những sản
              phẩm chất lượng với giá cả hợp lý. Chúng tôi không chỉ bán hàng mà
              còn xây dựng mối quan hệ lâu dài với khách hàng dựa trên sự tin
              tưởng và hài lòng.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-6 w-6 text-primary" />
              Tầm nhìn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              Trở thành nền tảng thương mại điện tử hàng đầu Việt Nam vào năm
              2030, được biết đến với sự đa dạng sản phẩm, chất lượng dịch vụ và
              trải nghiệm khách hàng xuất sắc. Chúng tôi hướng tới việc kết nối
              các thương hiệu uy tín với người tiêu dùng một cách hiệu quả nhất.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Core Values */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Giá trị cốt lõi
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => {
            const IconComponent = value.icon;
            return (
              <Card key={index} className="text-center">
                <CardContent className="pt-8">
                  <IconComponent
                    className={`h-12 w-12 mx-auto mb-4 ${value.color}`}
                  />
                  <h3 className="font-semibold text-lg mb-3">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="mb-16 bg-muted/30 rounded-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-12">
          Con số ấn tượng
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="text-center">
                <IconComponent className="h-8 w-8 text-primary mx-auto mb-3" />
                <div className="text-3xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Hành trình phát triển
        </h2>
        <div className="space-y-8">
          {milestones.map((milestone, index) => (
            <div key={index} className="flex gap-6">
              <div className="flex-shrink-0">
                <Badge className="text-lg px-4 py-2">{milestone.year}</Badge>
              </div>
              <Card className="flex-1">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-2">
                    {milestone.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {milestone.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Team & Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Đội ngũ Mini Shop</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Chúng tôi là một đội ngũ năng động, đam mê công nghệ và luôn nỗ lực
            để mang đến trải nghiệm tốt nhất cho khách hàng. Với tinh thần làm
            việc chuyên nghiệp và tinh thần đồng đội cao, chúng tôi không ngừng
            đổi mới và cải thiện dịch vụ.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <h4 className="font-semibold mb-2">Đội ngũ Công nghệ</h4>
              <p className="text-sm text-muted-foreground">
                Phát triển và vận hành nền tảng
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Đội ngũ Kinh doanh</h4>
              <p className="text-sm text-muted-foreground">
                Quản lý sản phẩm và đối tác
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Đội ngũ Hỗ trợ</h4>
              <p className="text-sm text-muted-foreground">
                Chăm sóc khách hàng 24/7
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
