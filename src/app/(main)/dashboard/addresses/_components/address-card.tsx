"use client";

import { useState } from "react";
import { MapPin, Edit, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useDeleteAddress, useSetDefaultAddress } from "@/hooks/addresses";
import EditAddressDialog from "./edit-address-dialog";
import type { Address } from "@/types/custom.types";

interface AddressCardProps {
  address: Address;
}

export default function AddressCard({ address }: AddressCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const deleteAddress = useDeleteAddress();
  const setDefaultAddress = useSetDefaultAddress();

  const handleDelete = () => {
    if (confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) {
      deleteAddress.mutate({ addressId: address.id });
    }
  };

  const handleSetDefault = () => {
    setDefaultAddress.mutate({
      addressId: address.id,
      type: address.type as "shipping" | "billing",
    });
  };

  const getAddressTypeLabel = (type: string) => {
    return type === "shipping" ? "Giao hàng" : "Thanh toán";
  };

  const getAddressTypeVariant = (type: string) => {
    return type === "shipping" ? "default" : "secondary";
  };

  return (
    <>
      <Card className={`${address.is_default ? "ring-2 ring-primary" : ""}`}>
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="font-medium">
                  {address.first_name} {address.last_name}
                </span>
              </div>

              <Badge
                variant={getAddressTypeVariant(address.type)}
                className="text-xs"
              >
                {getAddressTypeLabel(address.type)}
              </Badge>

              {address.is_default && (
                <Badge variant="default" className="text-xs bg-primary">
                  <Star className="h-3 w-3 mr-1" />
                  Mặc định
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setShowEditDialog(true)}
                size="sm"
                variant="outline"
                className="px-3"
              >
                <Edit className="h-4 w-4" />
              </Button>

              <Button
                onClick={handleDelete}
                disabled={deleteAddress.isPending}
                size="sm"
                variant="outline"
                className="px-3 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Address Details */}
          <div className="space-y-2 text-sm text-gray-600">
            {address.company && (
              <p className="font-medium text-gray-900">{address.company}</p>
            )}

            <p>{address.address_line_1}</p>

            {address.address_line_2 && <p>{address.address_line_2}</p>}

            <p>
              {address.city}, {address.state} {address.postal_code}
            </p>

            <p>{address.country}</p>

            {address.phone && (
              <p className="flex items-center space-x-1">
                <span>📞</span>
                <span>{address.phone}</span>
              </p>
            )}
          </div>

          {/* Actions */}
          {!address.is_default && (
            <div className="mt-4 pt-4 border-t">
              <Button
                onClick={handleSetDefault}
                disabled={setDefaultAddress.isPending}
                size="sm"
                variant="ghost"
                className="text-primary hover:text-primary-foreground hover:bg-primary"
              >
                <Star className="h-4 w-4 mr-1" />
                {setDefaultAddress.isPending
                  ? "Đang cập nhật..."
                  : "Đặt làm mặc định"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <EditAddressDialog
        address={address}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
    </>
  );
}
