"use client";

import { useState } from "react";
import { MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddAddressDialog from "./add-address-dialog";

export default function AddressesHeader() {
  const [showAddDialog, setShowAddDialog] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <MapPin className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý địa chỉ
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý địa chỉ giao hàng và thanh toán của bạn
            </p>
          </div>
        </div>

        <Button
          onClick={() => setShowAddDialog(true)}
          className="inline-flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm địa chỉ mới
        </Button>
      </div>

      <AddAddressDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
    </>
  );
}
