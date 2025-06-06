import { MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AddressesEmptyProps {
  onAddClick?: () => void;
}

export default function AddressesEmpty({ onAddClick }: AddressesEmptyProps) {
  return (
    <div className="text-center py-16">
      <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
        <MapPin className="h-12 w-12 text-blue-400" />
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Chưa có địa chỉ nào
      </h3>

      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Thêm địa chỉ giao hàng để thuận tiện cho việc đặt hàng và thanh toán
      </p>

      <Button
        onClick={onAddClick}
        size="lg"
        className="inline-flex items-center"
      >
        <Plus className="mr-2 h-4 w-4" />
        Thêm địa chỉ đầu tiên
      </Button>
    </div>
  );
}
