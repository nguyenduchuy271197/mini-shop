"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useCreateCoupon } from "@/hooks/admin/coupons";
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

  const createCoupon = useCreateCoupon({
    onSuccess: () => {
      toast.success("Mã giảm giá đã được tạo thành công");
      setOpen(false);
    },
    onError: (error) => {
      toast.error("Có lỗi xảy ra khi tạo mã giảm giá: " + String(error));
    },
  });

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
