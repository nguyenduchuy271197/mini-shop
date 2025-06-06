"use client";

import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useCreateAddress, type CreateAddressData } from "@/hooks/addresses";

interface AddressFormData {
  first_name: string;
  last_name: string;
  company?: string | null;
  address_line_1: string;
  address_line_2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string | null;
  is_default: boolean;
}

interface AddressFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (address: {
    first_name: string;
    last_name: string;
    company?: string | null;
    address_line_1: string;
    address_line_2?: string | null;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone?: string | null;
    is_default: boolean;
  }) => void;
  type: "shipping" | "billing";
}

export default function AddressFormDialog({
  open,
  onOpenChange,
  onSuccess,
  type,
}: AddressFormDialogProps) {
  const createAddress = useCreateAddress();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddressFormData>({
    defaultValues: {
      country: "VN",
      is_default: false,
    },
  });

  const onSubmit = async (data: AddressFormData) => {
    const addressData: CreateAddressData = {
      type: type,
      first_name: data.first_name,
      last_name: data.last_name,
      company: data.company || undefined,
      address_line_1: data.address_line_1,
      address_line_2: data.address_line_2 || undefined,
      city: data.city,
      state: data.state,
      postal_code: data.postal_code,
      country: data.country,
      phone: data.phone || undefined,
      is_default: data.is_default,
    };

    createAddress.mutate(addressData, {
      onSuccess: (result) => {
        if (result.success) {
          onSuccess?.(result.address);
          reset();
          onOpenChange(false);
        }
      },
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Thêm địa chỉ {type === "shipping" ? "giao hàng" : "thanh toán"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">Họ và tên đệm *</Label>
              <Input
                id="first_name"
                {...register("first_name")}
                placeholder="Nguyễn Văn"
              />
              {errors.first_name && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.first_name.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="last_name">Tên *</Label>
              <Input
                id="last_name"
                {...register("last_name")}
                placeholder="A"
              />
              {errors.last_name && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.last_name.message}
                </p>
              )}
            </div>
          </div>

          {/* Company */}
          <div>
            <Label htmlFor="company">Công ty (Tùy chọn)</Label>
            <Input
              id="company"
              {...register("company")}
              placeholder="Tên công ty"
            />
          </div>

          {/* Address */}
          <div>
            <Label htmlFor="address_line_1">Địa chỉ *</Label>
            <Input
              id="address_line_1"
              {...register("address_line_1")}
              placeholder="Số nhà, tên đường"
            />
            {errors.address_line_1 && (
              <p className="text-sm text-red-600 mt-1">
                {errors.address_line_1.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="address_line_2">Địa chỉ 2 (Tùy chọn)</Label>
            <Input
              id="address_line_2"
              {...register("address_line_2")}
              placeholder="Căn hộ, tầng, tòa nhà"
            />
          </div>

          {/* City, State, Postal Code */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">Quận/Huyện *</Label>
              <Input id="city" {...register("city")} placeholder="Quận 1" />
              {errors.city && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.city.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="state">Tỉnh/TP *</Label>
              <Input id="state" {...register("state")} placeholder="TP. HCM" />
              {errors.state && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.state.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="postal_code">Mã bưu điện *</Label>
              <Input
                id="postal_code"
                {...register("postal_code")}
                placeholder="700000"
              />
              {errors.postal_code && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.postal_code.message}
                </p>
              )}
            </div>
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone">Số điện thoại (Tùy chọn)</Label>
            <Input id="phone" {...register("phone")} placeholder="0901234567" />
          </div>

          {/* Default checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_default"
              {...register("is_default")}
              className="rounded border-gray-300"
            />
            <Label htmlFor="is_default">Đặt làm địa chỉ mặc định</Label>
          </div>

          {/* Submit buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={createAddress.isPending}>
              {createAddress.isPending ? "Đang lưu..." : "Lưu địa chỉ"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
