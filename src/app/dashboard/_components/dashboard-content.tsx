"use client";

import { Profile } from "@/types/custom.types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  ShoppingBag,
  Heart,
  Settings,
  CreditCard,
  MapPin,
  Star,
  LogOut,
} from "lucide-react";
import Link from "next/link";

interface DashboardContentProps {
  profile: Profile;
}

export default function DashboardContent({ profile }: DashboardContentProps) {
  const getAvatarFallback = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const quickActions = [
    {
      title: "Hồ sơ cá nhân",
      description: "Xem và chỉnh sửa thông tin cá nhân",
      icon: User,
      href: "/profile",
      color: "bg-blue-500",
    },
    {
      title: "Đơn hàng",
      description: "Theo dõi đơn hàng và lịch sử mua hàng",
      icon: ShoppingBag,
      href: "/orders",
      color: "bg-green-500",
    },
    {
      title: "Danh sách yêu thích",
      description: "Xem sản phẩm đã lưu yêu thích",
      icon: Heart,
      href: "/wishlist",
      color: "bg-red-500",
    },
    {
      title: "Địa chỉ",
      description: "Quản lý địa chỉ giao hàng",
      icon: MapPin,
      href: "/addresses",
      color: "bg-purple-500",
    },
    {
      title: "Đánh giá",
      description: "Đánh giá sản phẩm đã mua",
      icon: Star,
      href: "/reviews",
      color: "bg-yellow-500",
    },
    {
      title: "Thanh toán",
      description: "Lịch sử thanh toán và hóa đơn",
      icon: CreditCard,
      href: "/payments",
      color: "bg-indigo-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Mini Shop Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <Link href="/profile">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Cài đặt
                </Button>
              </Link>
              <form action="/auth/logout" method="post">
                <Button variant="ghost" size="sm" type="submit">
                  <LogOut className="h-4 w-4 mr-2" />
                  Đăng xuất
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center space-x-6">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={profile.avatar_url || ""}
                  alt={profile.full_name || "Avatar"}
                />
                <AvatarFallback className="text-lg">
                  {getAvatarFallback(profile.full_name || profile.email)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Chào mừng, {profile.full_name || "Khách hàng"}!
                </h2>
                <p className="text-gray-600">{profile.email}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Tham gia từ:{" "}
                  {new Date(profile.created_at).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Truy cập nhanh
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div
                        className={`${action.color} p-3 rounded-lg text-white`}
                      >
                        <action.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {action.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <p>Chưa có hoạt động nào gần đây.</p>
              <p className="text-sm mt-2">
                Hãy bắt đầu mua sắm để xem lịch sử hoạt động của bạn!
              </p>
              <Link href="/">
                <Button className="mt-4">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Bắt đầu mua sắm
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
