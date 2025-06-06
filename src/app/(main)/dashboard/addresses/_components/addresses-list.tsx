"use client";

import { useEffect, useState } from "react";
import { useUserAddresses } from "@/hooks/addresses";
import AddressCard from "./address-card";
import AddressesEmpty from "./addresses-empty";
import { Skeleton } from "@/components/ui/skeleton";

export default function AddressesList() {
  const { data: addressesData, isLoading, error } = useUserAddresses();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return <AddressesListSkeleton />;
  }

  if (isLoading) {
    return <AddressesListSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Có lỗi xảy ra khi tải danh sách địa chỉ</p>
      </div>
    );
  }

  if (!addressesData?.success) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Không thể tải danh sách địa chỉ</p>
      </div>
    );
  }

  const addresses = addressesData.addresses || [];

  if (addresses.length === 0) {
    return <AddressesEmpty />;
  }

  // Sort addresses: default first, then by created date
  const sortedAddresses = addresses.sort((a, b) => {
    if (a.is_default && !b.is_default) return -1;
    if (!a.is_default && b.is_default) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">
          Địa chỉ của bạn ({addresses.length})
        </h2>
      </div>

      <div className="space-y-4">
        {sortedAddresses.map((address) => (
          <AddressCard key={address.id} address={address} />
        ))}
      </div>
    </div>
  );
}

function AddressesListSkeleton() {
  return (
    <div className="mt-8">
      <Skeleton className="h-6 w-48 mb-6" />
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex space-x-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
