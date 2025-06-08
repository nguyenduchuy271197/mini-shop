"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft, ShoppingBag } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* 404 Number */}
        <div className="space-y-4">
          <h1 className="text-9xl font-bold text-gray-200 select-none">404</h1>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">
              Trang không tồn tại
            </h2>
            <p className="text-gray-600">
              Xin lỗi, chúng tôi không thể tìm thấy trang bạn đang tìm kiếm.
            </p>
          </div>
        </div>

        {/* Illustration */}
        <div className="flex justify-center">
          <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
            <Search className="w-16 h-16 text-gray-400" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <Button asChild className="w-full">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Về trang chủ
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full">
              <Link href="/products">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Xem sản phẩm
              </Link>
            </Button>
          </div>

          <Button
            asChild
            variant="ghost"
            className="w-full text-gray-600 hover:text-gray-900"
            onClick={() => window.history.back()}
          >
            <button type="button">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại trang trước
            </button>
          </Button>
        </div>
      </div>
    </div>
  );
}
