import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, ShoppingBag, Heart, MapPin } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tài khoản của tôi",
  description:
    "Quản lý tài khoản cá nhân, xem lịch sử đơn hàng, cập nhật thông tin và theo dõi giao hàng tại Minishop.",
  keywords: "tài khoản, thông tin cá nhân, lịch sử đơn hàng, dashboard",
  openGraph: {
    title: "Tài khoản của tôi | Minishop",
    description: "Quản lý tài khoản cá nhân tại Minishop",
    url: "/dashboard",
    images: [
      {
        url: "https://images.unsplash.com/photo-1556742111-a301076d9d18?w=1200&h=630&fit=crop",
        width: 1200,
        height: 630,
        alt: "Dashboard Minishop",
      },
    ],
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Chào mừng bạn đến với Mini Shop! Quản lý tài khoản và đơn hàng của
            bạn tại đây.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Thông tin cá nhân
              </CardTitle>
              <CardDescription>
                Quản lý thông tin cá nhân và ảnh đại diện
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <Link href="/dashboard/profile">Xem thông tin</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Orders Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Đơn hàng
              </CardTitle>
              <CardDescription>
                Theo dõi trạng thái đơn hàng của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <Link href="/dashboard/orders">Xem đơn hàng</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Wishlist Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Danh sách yêu thích
              </CardTitle>
              <CardDescription>
                Các sản phẩm bạn đã lưu để mua sau
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <Link href="/dashboard/wishlist">Xem danh sách</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Addresses Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Địa chỉ giao hàng
              </CardTitle>
              <CardDescription>
                Quản lý địa chỉ giao hàng của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <Link href="/dashboard/addresses">Quản lý địa chỉ</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
