import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Liên hệ với chúng tôi</h1>
        <p className="text-lg text-muted-foreground">
          Chúng tôi luôn sẵn sàng hỗ trợ và giải đáp mọi thắc mắc của bạn
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Gửi tin nhắn cho chúng tôi</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Họ và tên *</Label>
                    <Input id="name" placeholder="Nhập họ và tên" required />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Nhập email"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input id="phone" placeholder="Nhập số điện thoại" />
                </div>
                <div>
                  <Label htmlFor="subject">Chủ đề *</Label>
                  <Input id="subject" placeholder="Nhập chủ đề" required />
                </div>
                <div>
                  <Label htmlFor="message">Nội dung *</Label>
                  <Textarea
                    id="message"
                    placeholder="Nhập nội dung tin nhắn..."
                    rows={6}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Gửi tin nhắn
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin liên hệ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start space-x-4">
                <MapPin className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Địa chỉ</h3>
                  <p className="text-muted-foreground">
                    123 Đường ABC, Phường XYZ
                    <br />
                    Quận 1, TP. Hồ Chí Minh
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Phone className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Điện thoại</h3>
                  <p className="text-muted-foreground">
                    Hotline: 1900 1234
                    <br />
                    Mobile: 0123 456 789
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Mail className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Email</h3>
                  <p className="text-muted-foreground">
                    Hỗ trợ: support@minishop.vn
                    <br />
                    Kinh doanh: sales@minishop.vn
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Clock className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Giờ làm việc</h3>
                  <p className="text-muted-foreground">
                    Thứ 2 - Thứ 6: 8:00 - 18:00
                    <br />
                    Thứ 7: 8:00 - 12:00
                    <br />
                    Chủ nhật: Nghỉ
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Map placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Bản đồ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg h-64 flex items-center justify-center">
                <p className="text-muted-foreground">
                  Bản đồ sẽ được hiển thị tại đây
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
