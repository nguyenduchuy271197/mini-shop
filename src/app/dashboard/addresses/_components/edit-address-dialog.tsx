"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUpdateAddress, type UpdateAddressData } from "@/hooks/addresses";
import AddressForm from "@/components/forms/address-form";
import type { Address } from "@/types/custom.types";

interface EditAddressDialogProps {
  address: Address;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Define the form data type based on AddressForm's interface
interface AddressFormData {
  type: "shipping" | "billing";
  full_name: string;
  phone_number: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export default function EditAddressDialog({
  address,
  open,
  onOpenChange,
}: EditAddressDialogProps) {
  const updateAddress = useUpdateAddress();

  const handleSubmit = (data: AddressFormData) => {
    // Split full_name into first_name and last_name
    const nameParts = data.full_name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const updateAddressData: UpdateAddressData = {
      addressId: address.id,
      type: data.type,
      first_name: firstName,
      last_name: lastName,
      address_line_1: data.address_line_1,
      address_line_2: data.address_line_2,
      city: data.city,
      state: data.state,
      postal_code: data.postal_code,
      country: data.country,
      phone: data.phone_number,
      is_default: data.is_default,
    };

    updateAddress.mutate(updateAddressData, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa địa chỉ</DialogTitle>
        </DialogHeader>

        <AddressForm
          initialData={address}
          onSubmit={handleSubmit}
          isLoading={updateAddress.isPending}
          submitText="Cập nhật địa chỉ"
        />
      </DialogContent>
    </Dialog>
  );
}
