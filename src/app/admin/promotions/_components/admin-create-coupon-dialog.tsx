"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CouponForm } from "./coupon-form";

interface AdminCreateCouponDialogProps {
  children: React.ReactNode;
}

export function AdminCreateCouponDialog({
  children,
}: AdminCreateCouponDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  const handleBack = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo Mã Giảm Giá Mới</DialogTitle>
          <DialogDescription>
            Tạo mã giảm giá mới cho chương trình khuyến mãi
          </DialogDescription>
        </DialogHeader>

        <CouponForm
          mode="create"
          onBack={handleBack}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
