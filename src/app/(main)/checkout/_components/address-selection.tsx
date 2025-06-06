"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin } from "lucide-react";
import { useUserAddresses } from "@/hooks/addresses";
import AddressFormDialog from "@/components/addresses/address-form-dialog";
import type { AddressData } from "@/types/custom.types";

interface AddressSelectionProps {
  selectedAddress: AddressData | null;
  onAddressSelect: (address: AddressData) => void;
  type: "shipping" | "billing";
}

export default function AddressSelection({
  selectedAddress,
  onAddressSelect,
  type,
}: AddressSelectionProps) {
  const [showAddressForm, setShowAddressForm] = useState(false);
  const { data: addressesData, isLoading } = useUserAddresses();

  const addresses =
    (addressesData?.success ? addressesData.addresses : []) || [];

  const formatAddress = (address: {
    address_line_1: string;
    address_line_2?: string | null;
    city: string;
    state: string;
    postal_code: string;
  }) => {
    return `${address.address_line_1}${
      address.address_line_2 ? ", " + address.address_line_2 : ""
    }, ${address.city}, ${address.state} ${address.postal_code}`;
  };

  const handleAddressCreated = (newAddress: {
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
  }) => {
    // Convert to AddressData format
    const addressData: AddressData = {
      first_name: newAddress.first_name,
      last_name: newAddress.last_name,
      company: newAddress.company || undefined,
      address_line_1: newAddress.address_line_1,
      address_line_2: newAddress.address_line_2 || undefined,
      city: newAddress.city,
      state: newAddress.state,
      postal_code: newAddress.postal_code,
      country: newAddress.country,
      phone: newAddress.phone || undefined,
    };

    onAddressSelect(addressData);
    setShowAddressForm(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Existing Addresses */}
      {addresses.length > 0 && (
        <div className="space-y-3">
          {addresses.map((address) => {
            const addressData: AddressData = {
              first_name: address.first_name,
              last_name: address.last_name,
              company: address.company || undefined,
              address_line_1: address.address_line_1,
              address_line_2: address.address_line_2 || undefined,
              city: address.city,
              state: address.state,
              postal_code: address.postal_code,
              country: address.country,
              phone: address.phone || undefined,
            };

            const isSelected =
              selectedAddress?.address_line_1 === address.address_line_1 &&
              selectedAddress?.city === address.city;

            return (
              <Card
                key={address.id}
                className={`p-4 cursor-pointer transition-all ${
                  isSelected
                    ? "ring-2 ring-primary border-primary"
                    : "hover:border-gray-300"
                }`}
                onClick={() => onAddressSelect(addressData)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <input
                        type="radio"
                        checked={isSelected}
                        onChange={() => onAddressSelect(addressData)}
                        className="text-primary"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">
                          {address.first_name} {address.last_name}
                        </h4>
                        {address.is_default && (
                          <Badge variant="secondary" className="text-xs">
                            Mặc định
                          </Badge>
                        )}
                      </div>
                      {address.company && (
                        <p className="text-sm text-gray-600 mb-1">
                          {address.company}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {formatAddress(address)}
                      </p>
                      {address.phone && (
                        <p className="text-sm text-gray-600 mt-1">
                          SĐT: {address.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add New Address */}
      <Button
        variant="outline"
        onClick={() => setShowAddressForm(true)}
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        Thêm địa chỉ mới
      </Button>

      {/* Address Form Dialog */}
      <AddressFormDialog
        open={showAddressForm}
        onOpenChange={setShowAddressForm}
        onSuccess={handleAddressCreated}
        type={type}
      />
    </div>
  );
}
