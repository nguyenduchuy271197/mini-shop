"use client";

import { useState } from "react";
import { AdminPageWrapper } from "@/components/admin/admin-page-wrapper";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ShippingZonesList } from "./_components/shipping-zones-list";
import { ShippingZoneForm } from "./_components/shipping-zone-form";

type ViewState = "list" | "create" | "edit" | "view" | "manage-rates";

export default function ShippingPage() {
  const [viewState, setViewState] = useState<ViewState>("list");
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);

  const handleCreateZone = () => {
    setSelectedZoneId(null);
    setViewState("create");
  };

  const handleEditZone = (zoneId: number) => {
    setSelectedZoneId(zoneId);
    setViewState("edit");
  };

  const handleViewZone = (zoneId: number) => {
    setSelectedZoneId(zoneId);
    setViewState("view");
  };

  const handleManageRates = (zoneId: number) => {
    setSelectedZoneId(zoneId);
    setViewState("manage-rates");
  };

  const handleBack = () => {
    setSelectedZoneId(null);
    setViewState("list");
  };

  const handleSuccess = () => {
    // Refresh will be handled by the query invalidation in hooks
  };

  return (
    <AdminPageWrapper>
      <AdminPageHeader
        title="Quản Lý Vận Chuyển"
        description="Cấu hình phí vận chuyển theo khu vực, trọng lượng"
      />

      {viewState === "list" ? (
        <ShippingZonesList
          onCreateZone={handleCreateZone}
          onEditZone={handleEditZone}
          onViewZone={handleViewZone}
          onManageRates={handleManageRates}
        />
      ) : viewState === "create" ? (
        <ShippingZoneForm
          mode="create"
          onBack={handleBack}
          onSuccess={handleSuccess}
        />
      ) : viewState === "edit" ? (
        <ShippingZoneForm
          mode="edit"
          zone={selectedZoneId ? { id: selectedZoneId } : undefined}
          onBack={handleBack}
          onSuccess={handleSuccess}
        />
      ) : viewState === "manage-rates" ? (
        // Placeholder for shipping rates management
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4">Quản Lý Phí Vận Chuyển</h2>
          <p className="text-gray-600 mb-6">
            Tính năng quản lý phí vận chuyển sẽ được phát triển tiếp theo
          </p>
          <button
            onClick={handleBack}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Quay Lại
          </button>
        </div>
      ) : (
        // View mode - for now, redirect to edit
        <ShippingZoneForm
          mode="edit"
          zone={selectedZoneId ? { id: selectedZoneId } : undefined}
          onBack={handleBack}
          onSuccess={handleSuccess}
        />
      )}
    </AdminPageWrapper>
  );
}
