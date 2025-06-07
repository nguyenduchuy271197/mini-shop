import {
  Briefcase,
  Users,
  Globe,
  Heart,
  TrendingUp,
  MapPin,
  Clock,
  DollarSign,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function CareersPage() {
  const benefits = [
    {
      icon: DollarSign,
      title: "Lương thưởng hấp dẫn",
      description: "Mức lương cạnh tranh với thưởng hiệu suất hàng quý",
    },
    {
      icon: TrendingUp,
      title: "Phát triển sự nghiệp",
      description: "Cơ hội thăng tiến và đào tạo chuyên môn thường xuyên",
    },
    {
      icon: Heart,
      title: "Chăm sóc sức khỏe",
      description: "Bảo hiểm y tế toàn diện và khám sức khỏe định kỳ",
    },
    {
      icon: Globe,
      title: "Làm việc linh hoạt",
      description: "Hỗ trợ remote/hybrid và giờ làm việc linh hoạt",
    },
    {
      icon: Users,
      title: "Môi trường thân thiện",
      description: "Văn hóa doanh nghiệp tích cực và đồng nghiệp hỗ trợ",
    },
    {
      icon: Briefcase,
      title: "Trang thiết bị hiện đại",
      description: "Laptop, công cụ làm việc và không gian văn phòng tốt",
    },
  ];

  const openPositions = [
    {
      title: "Senior Frontend Developer",
      department: "Công nghệ",
      location: "TP. Hồ Chí Minh",
      type: "Full-time",
      experience: "3+ năm",
      skills: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
      description:
        "Phát triển giao diện người dùng cho nền tảng e-commerce với trải nghiệm tuyệt vời",
    },
    {
      title: "Backend Developer",
      department: "Công nghệ",
      location: "Hà Nội / Remote",
      type: "Full-time",
      experience: "2+ năm",
      skills: ["Node.js", "PostgreSQL", "API Design", "Microservices"],
      description:
        "Xây dựng và duy trì hệ thống backend ổn định, có khả năng mở rộng cao",
    },
    {
      title: "Product Manager",
      department: "Sản phẩm",
      location: "TP. Hồ Chí Minh",
      type: "Full-time",
      experience: "3+ năm",
      skills: ["Product Strategy", "Data Analysis", "UX/UI", "Agile"],
      description:
        "Định hướng phát triển sản phẩm và tối ưu hóa trải nghiệm khách hàng",
    },
    {
      title: "Digital Marketing Specialist",
      department: "Marketing",
      location: "TP. Hồ Chí Minh",
      type: "Full-time",
      experience: "2+ năm",
      skills: ["SEO/SEM", "Social Media", "Analytics", "Content Marketing"],
      description:
        "Phát triển và thực hiện các chiến lược marketing online hiệu quả",
    },
    {
      title: "Customer Success Manager",
      department: "Khách hàng",
      location: "Đa địa điểm",
      type: "Full-time",
      experience: "1+ năm",
      skills: ["Customer Service", "CRM", "Communication", "Problem Solving"],
      description: "Đảm bảo sự hài lòng và thành công của khách hàng",
    },
    {
      title: "Data Analyst",
      department: "Dữ liệu",
      location: "Remote",
      type: "Full-time",
      experience: "2+ năm",
      skills: ["SQL", "Python", "Tableau", "Statistics"],
      description: "Phân tích dữ liệu kinh doanh và đưa ra insights có giá trị",
    },
  ];

  const departments = [
    {
      name: "Công nghệ",
      description: "Phát triển và vận hành nền tảng công nghệ",
      positions: 8,
      color: "bg-blue-100 text-blue-800",
    },
    {
      name: "Sản phẩm",
      description: "Thiết kế và quản lý trải nghiệm sản phẩm",
      positions: 3,
      color: "bg-green-100 text-green-800",
    },
    {
      name: "Marketing",
      description: "Phát triển thương hiệu và tiếp cận khách hàng",
      positions: 5,
      color: "bg-purple-100 text-purple-800",
    },
    {
      name: "Vận hành",
      description: "Quản lý chuỗi cung ứng và giao hàng",
      positions: 4,
      color: "bg-orange-100 text-orange-800",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-16">
        <Briefcase className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-6">Cơ hội nghề nghiệp</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Gia nhập đội ngũ Mini Shop để cùng xây dựng tương lai của thương mại
          điện tử Việt Nam. Chúng tôi tìm kiếm những tài năng đầy đam mê để cùng
          phát triển và thành công.
        </p>
      </div>

      {/* Why Join Us */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Tại sao nên chọn Mini Shop?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <Card key={index}>
                <CardContent className="pt-6">
                  <IconComponent className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Departments */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Các phòng ban</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {departments.map((dept, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg">{dept.name}</h3>
                  <Badge className={dept.color}>{dept.positions} vị trí</Badge>
                </div>
                <p className="text-muted-foreground text-sm">
                  {dept.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Open Positions */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Vị trí đang tuyển
        </h2>
        <div className="space-y-6">
          {openPositions.map((position, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl mb-2">
                      {position.title}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {position.department}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {position.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {position.type}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">{position.experience}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {position.description}
                </p>
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Kỹ năng yêu cầu:</h4>
                  <div className="flex flex-wrap gap-2">
                    {position.skills.map((skill, skillIndex) => (
                      <Badge
                        key={skillIndex}
                        variant="secondary"
                        className="text-xs"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button>Ứng tuyển ngay</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Application Process */}
      <Card className="mb-16">
        <CardHeader>
          <CardTitle className="text-center">Quy trình tuyển dụng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold mb-3 mx-auto">
                1
              </div>
              <h3 className="font-medium mb-2">Ứng tuyển</h3>
              <p className="text-sm text-muted-foreground">
                Gửi CV và thư xin việc qua website hoặc email
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold mb-3 mx-auto">
                2
              </div>
              <h3 className="font-medium mb-2">Sàng lọc hồ sơ</h3>
              <p className="text-sm text-muted-foreground">
                HR review hồ sơ và liên hệ các ứng viên phù hợp
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold mb-3 mx-auto">
                3
              </div>
              <h3 className="font-medium mb-2">Phỏng vấn</h3>
              <p className="text-sm text-muted-foreground">
                Phỏng vấn với HR và hiring manager (online/offline)
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold mb-3 mx-auto">
                4
              </div>
              <h3 className="font-medium mb-2">Onboarding</h3>
              <p className="text-sm text-muted-foreground">
                Đào tạo và hướng dẫn cho nhân viên mới
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Liên hệ tuyển dụng</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-6">
            Không tìm thấy vị trí phù hợp? Hãy gửi CV cho chúng tôi để cân nhắc
            cho các cơ hội trong tương lai.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-medium mb-2">Email tuyển dụng</h4>
              <p className="text-sm text-muted-foreground">
                careers@minishop.vn
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Hotline HR</h4>
              <p className="text-sm text-muted-foreground">0123 456 789</p>
            </div>
          </div>
          <Button size="lg">Gửi CV ứng tuyển</Button>
        </CardContent>
      </Card>
    </div>
  );
}
