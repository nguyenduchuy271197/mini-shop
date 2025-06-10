import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, CreditCard } from "lucide-react";

const paymentMethods = [
  {
    id: "cod",
    name: "Thanh toán khi nhận hàng (COD)",
    description: "Thanh toán tiền mặt khi nhận hàng",
    icon: <Truck className="w-5 h-5" />,
    fee: 0,
    recommended: true,
  },
  {
    id: "vnpay",
    name: "VNPay",
    description: "Thanh toán qua VNPay - Hỗ trợ thẻ ATM, Visa, Mastercard",
    icon: <CreditCard className="w-5 h-5" />,
    fee: 0,
    recommended: false,
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Thanh toán bằng thẻ tín dụng/ghi nợ",
    icon: <CreditCard className="w-5 h-5" />,
    fee: 0,
    recommended: false,
  },
];

interface PaymentMethodSelectionProps {
  selectedMethod: string;
  onMethodSelect: (method: string) => void;
}

export default function PaymentMethodSelection({
  selectedMethod,
  onMethodSelect,
}: PaymentMethodSelectionProps) {
  const formatFee = (fee: number) => {
    if (fee === 0) return "Miễn phí";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(fee);
  };

  return (
    <div className="space-y-3">
      {paymentMethods.map((method) => {
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
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">{method.name}</h4>
                    {method.recommended && (
                      <Badge variant="secondary" className="text-xs">
                        Khuyến nghị
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-2">
                    {method.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Phí: {formatFee(method.fee)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional info for specific methods */}
            {isSelected && method.id === "stripe" && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border-t">
                <div className="text-sm text-blue-700 space-y-1">
                  <p>✓ Bảo mật cao với mã hóa SSL</p>
                  <p>✓ Hỗ trợ Visa, Mastercard, American Express</p>
                  <p>✓ Thanh toán nhanh chóng và an toàn</p>
                </div>
              </div>
            )}

            {isSelected && method.id === "cod" && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg border-t">
                <div className="text-sm text-green-700 space-y-1">
                  <p>✓ Kiểm tra hàng trước khi thanh toán</p>
                  <p>✓ Chấp nhận tiền mặt</p>
                  <p>✓ Không cần tài khoản ngân hàng</p>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
