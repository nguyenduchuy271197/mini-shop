import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Zap, Clock } from "lucide-react";

const shippingMethods = [
  {
    id: "standard",
    name: "Giao hàng tiêu chuẩn",
    description: "Giao hàng trong 3-5 ngày làm việc",
    icon: <Truck className="w-5 h-5" />,
    price: 30000,
    estimatedDays: "3-5 ngày",
    recommended: true,
  },
  {
    id: "express",
    name: "Giao hàng nhanh",
    description: "Giao hàng trong 1-2 ngày làm việc",
    icon: <Zap className="w-5 h-5" />,
    price: 50000,
    estimatedDays: "1-2 ngày",
    recommended: false,
  },
  {
    id: "same_day",
    name: "Giao hàng trong ngày",
    description: "Giao hàng trong vòng 24 giờ (chỉ áp dụng nội thành)",
    icon: <Clock className="w-5 h-5" />,
    price: 80000,
    estimatedDays: "Trong ngày",
    recommended: false,
    note: "Chỉ áp dụng cho nội thành TP.HCM",
  },
];

interface ShippingMethodSelectionProps {
  selectedMethod: string;
  onMethodSelect: (method: string) => void;
}

export default function ShippingMethodSelection({
  selectedMethod,
  onMethodSelect,
}: ShippingMethodSelectionProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="space-y-3">
      {shippingMethods.map((method) => {
        const isSelected = selectedMethod === method.id;

        return (
          <Card
            key={method.id}
            className={`p-4 cursor-pointer transition-all ${
              isSelected
                ? "ring-2 ring-primary border-primary"
                : "hover:border-gray-300"
            }`}
            onClick={() => onMethodSelect(method.id)}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <input
                  type="radio"
                  checked={isSelected}
                  onChange={() => onMethodSelect(method.id)}
                  className="text-primary"
                />
              </div>

              <div className="flex-1 flex items-start space-x-3">
                <div className="flex-shrink-0 text-gray-500 mt-0.5">
                  {method.icon}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">
                        {method.name}
                      </h4>
                      {method.recommended && (
                        <Badge variant="secondary" className="text-xs">
                          Khuyến nghị
                        </Badge>
                      )}
                    </div>
                    <span className="font-medium text-gray-900">
                      {formatPrice(method.price)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">
                    {method.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-600 font-medium">
                      Thời gian: {method.estimatedDays}
                    </span>
                  </div>

                  {method.note && (
                    <p className="text-xs text-orange-600 mt-2">
                      * {method.note}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        );
      })}

      {/* Free shipping note */}
      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-green-700 font-medium">
            Miễn phí vận chuyển cho đơn hàng từ 500.000đ
          </span>
        </div>
      </div>
    </div>
  );
}
