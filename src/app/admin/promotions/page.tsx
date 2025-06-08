"use client";

import { AdminPageWrapper } from "@/components/admin/admin-page-wrapper";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PromotionsList } from "./_components/promotions-list";

export default function PromotionsPage() {
  return (
    <AdminPageWrapper>
      <AdminPageHeader
        title="Quản Lý Khuyến Mãi"
        description="Tạo và quản lý mã giảm giá, chương trình khuyến mãi"
      />
      <PromotionsList />
    </AdminPageWrapper>
  );
}
