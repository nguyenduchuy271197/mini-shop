"use client";

import { PromotionsList } from "./_components/promotions-list";

export default function PromotionsPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Quản Lý Khuyến Mãi</h1>
        <p className="text-gray-600 mt-2">
          Tạo và quản lý mã giảm giá, chương trình khuyến mãi
        </p>
      </div>

      <PromotionsList />
    </div>
  );
}
