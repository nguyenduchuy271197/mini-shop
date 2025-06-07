"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Banner } from "@/hooks/admin/banners";
import BannersList from "./_components/banners-list";
import BannerForm from "./_components/banner-form";

type ViewMode = "list" | "create" | "edit";

export default function BannersPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleCreateBanner = () => {
    setSelectedBanner(null);
    setViewMode("create");
    setShowForm(true);
  };

  const handleEditBanner = (banner: Banner) => {
    setSelectedBanner(banner);
    setViewMode("edit");
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setViewMode("list");
    setSelectedBanner(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setViewMode("list");
    setSelectedBanner(null);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Quản Lý Banner</h1>
        <p className="text-muted-foreground">
          Thêm, sửa, xóa banner quảng cáo trên trang chủ
        </p>
      </div>

      <BannersList
        onCreateBanner={handleCreateBanner}
        onEditBanner={handleEditBanner}
      />

      {/* Banner Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {viewMode === "create" ? "Tạo banner mới" : "Chỉnh sửa banner"}
            </DialogTitle>
          </DialogHeader>
          <BannerForm
            banner={selectedBanner || undefined}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
