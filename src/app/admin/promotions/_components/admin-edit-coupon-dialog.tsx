"use client";

import { Coupon } from "@/types/custom.types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CouponForm } from "./coupon-form";

interface AdminEditCouponDialogProps {
  coupon: Coupon;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminEditCouponDialog({
  coupon,
  open,
  onOpenChange,
}: AdminEditCouponDialogProps) {
  const handleSuccess = () => {
    onOpenChange(false);
  };

  const handleBack = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh Sửa Mã Giảm Giá</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin mã giảm giá &ldquo;{coupon.code}&rdquo;
          </DialogDescription>
        </DialogHeader>

        <CouponForm
          mode="edit"
          coupon={coupon}
          onBack={handleBack}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
