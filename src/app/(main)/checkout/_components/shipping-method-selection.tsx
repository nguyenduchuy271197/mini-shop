import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Zap, Clock, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

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
  cartSubtotal?: number;
}

export default function ShippingMethodSelection({
  selectedMethod,
  onMethodSelect,
  cartSubtotal = 0,
}: ShippingMethodSelectionProps) {
  const FREE_SHIPPING_THRESHOLD = 500000;
  const isFreeShipping = cartSubtotal >= FREE_SHIPPING_THRESHOLD;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatPriceCompact = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const renderShippingPrice = (price: number) => {
    if (isFreeShipping) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-gray-400 line-through text-sm">
            {formatPriceCompact(price)}
          </span>
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-700 border-green-200 text-xs"
          >
            <Gift className="w-3 h-3 mr-1" />
            Miễn phí
          </Badge>
        </div>
      );
    }
    return (
      <span className="font-medium text-gray-900">{formatPrice(price)}</span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Free shipping banner */}
      {isFreeShipping ? (
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Gift className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div>
              <h4 className="text-green-800 font-semibold text-sm">
                🎉 Bạn được miễn phí vận chuyển
              </h4>
              <p className="text-green-700 text-xs mt-1">
                Đơn hàng của bạn đã đạt mức tối thiểu{" "}
                {formatPriceCompact(FREE_SHIPPING_THRESHOLD)}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-700">
              Mua thêm{" "}
              {formatPriceCompact(FREE_SHIPPING_THRESHOLD - cartSubtotal)} để
              được miễn phí vận chuyển
            </span>
          </div>
        </div>
      )}

      {/* Shipping methods */}
      <div className="space-y-3">
        {shippingMethods.map((method) => {
          const isSelected = selectedMethod === method.id;

          return (
            <Card
              key={method.id}
              className={cn(
                "p-4 cursor-pointer transition-all duration-200 hover:shadow-md",
                isSelected
                  ? "ring-2 ring-primary border-primary bg-primary/5"
                  : "hover:border-gray-300 hover:bg-gray-50"
              )}
              onClick={() => onMethodSelect(method.id)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <input
                    type="radio"
                    checked={isSelected}
                    onChange={() => onMethodSelect(method.id)}
                    className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                  />
                </div>

                <div className="flex-1 flex items-start space-x-3">
                  <div
                    className={cn(
                      "flex-shrink-0 mt-0.5 transition-colors",
                      isSelected ? "text-primary" : "text-gray-500"
                    )}
                  >
                    {method.icon}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">
                          {method.name}
                        </h4>
                        {method.recommended && (
                          <Badge variant="default" className="text-xs">
                            Khuyến nghị
                          </Badge>
                        )}
                      </div>
                      {renderShippingPrice(method.price)}
                    </div>

                    <p className="text-sm text-gray-600 mb-3">
                      {method.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {method.estimatedDays}
                        </span>
                        {isFreeShipping && (
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            Tiết kiệm {formatPriceCompact(method.price)}
                          </span>
                        )}
                      </div>
                    </div>

                    {method.note && (
                      <div className="mt-3 p-2 bg-orange-50 rounded-md border border-orange-200">
                        <p className="text-xs text-orange-700 flex items-start gap-1">
                          <span className="text-orange-500 mt-0.5">ⓘ</span>
                          {method.note}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Additional shipping info */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <h5 className="text-sm font-medium text-gray-800 mb-2">
          📋 Thông tin giao hàng
        </h5>
        <div className="text-xs text-gray-600 space-y-1">
          <p>• Giao hàng từ Thứ 2 đến Thứ 7 (8:00 - 18:00)</p>
          <p>• Kiểm tra hàng trước khi thanh toán (COD)</p>
          <p>• Đổi trả trong vòng 7 ngày nếu có lỗi</p>
        </div>
      </div>
    </div>
  );
}
