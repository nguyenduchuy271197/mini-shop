"use client";

import { useState } from "react";
import { PromotionsList } from "./_components/promotions-list";
import { CouponForm } from "./_components/coupon-form";
import { Coupon } from "@/types/custom.types";

type ViewState = "list" | "create" | "edit" | "view";

export default function PromotionsPage() {
  const [viewState, setViewState] = useState<ViewState>("list");
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  const handleCreateCoupon = () => {
    setSelectedCoupon(null);
    setViewState("create");
  };

  const handleEditCoupon = (couponId: number) => {
    // In a real app, we would fetch the coupon details here
    // For now, we'll set a placeholder and the form will handle loading
    setSelectedCoupon({ id: couponId } as Coupon);
    setViewState("edit");
  };

  const handleViewCoupon = (couponId: number) => {
    setSelectedCoupon({ id: couponId } as Coupon);
    setViewState("view");
  };

  const handleBack = () => {
    setSelectedCoupon(null);
    setViewState("list");
  };

  const handleSuccess = () => {
    // Refresh will be handled by the query invalidation in hooks
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Quản Lý Khuyến Mãi</h1>
        <p className="text-gray-600 mt-2">
          Tạo và quản lý mã giảm giá, chương trình khuyến mãi
        </p>
      </div>

      {viewState === "list" ? (
        <PromotionsList
          onCreateCoupon={handleCreateCoupon}
          onEditCoupon={handleEditCoupon}
          onViewCoupon={handleViewCoupon}
        />
      ) : viewState === "create" ? (
        <CouponForm
          mode="create"
          onBack={handleBack}
          onSuccess={handleSuccess}
        />
      ) : viewState === "edit" ? (
        <CouponForm
          mode="edit"
          coupon={selectedCoupon || undefined}
          onBack={handleBack}
          onSuccess={handleSuccess}
        />
      ) : (
        // View mode - for now, redirect to edit
        // In a real app, you might have a separate view component
        <CouponForm
          mode="edit"
          coupon={selectedCoupon || undefined}
          onBack={handleBack}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
