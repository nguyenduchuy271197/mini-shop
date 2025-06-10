"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Smartphone, Banknote, Building } from "lucide-react";
import { PaymentMethod } from "@/types/custom.types";

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
}

export default function PaymentMethodSelector({
  selectedMethod,
  onMethodChange,
}: PaymentMethodSelectorProps) {
  const paymentMethods = [
    {
      id: "stripe" as PaymentMethod,
      name: "Thẻ tín dụng/ghi nợ",
      description: "Visa, Mastercard, American Express",
      icon: CreditCard,
      recommended: true,
    },
    {
      id: "vnpay" as PaymentMethod,
      name: "VNPay",
      description: "Thanh toán qua ví điện tử VNPay",
      icon: Smartphone,
    },
    {
      id: "momo" as PaymentMethod,
      name: "MoMo",
      description: "Thanh toán qua ví điện tử MoMo",
      icon: Smartphone,
    },
    {
      id: "bank_transfer" as PaymentMethod,
      name: "Chuyển khoản ngân hàng",
      description: "Chuyển khoản trực tiếp qua ngân hàng",
      icon: Building,
    },
    {
      id: "cod" as PaymentMethod,
      name: "Thanh toán khi nhận hàng",
      description: "Thanh toán bằng tiền mặt khi nhận hàng",
      icon: Banknote,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phương thức thanh toán</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedMethod}
          onValueChange={(value) => onMethodChange(value as PaymentMethod)}
          className="space-y-3"
        >
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <div
                key={method.id}
                className={`flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedMethod === method.id
                    ? "border-primary bg-primary/5"
                    : "border-gray-200"
                }`}
                onClick={() => onMethodChange(method.id)}
              >
                <RadioGroupItem value={method.id} id={method.id} />
                <Icon className="h-6 w-6 text-gray-600" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor={method.id}
                      className="font-medium cursor-pointer"
                    >
                      {method.name}
                    </Label>
                    {method.recommended && (
                      <span className="inline-block px-2 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full">
                        Khuyến nghị
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {method.description}
                  </p>
                </div>
              </div>
            );
          })}
        </RadioGroup>

        {selectedMethod === "stripe" && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700">
              <CreditCard className="h-4 w-4" />
              <span className="text-sm font-medium">
                Bảo mật cao với Stripe
              </span>
            </div>
            <p className="text-sm text-blue-600 mt-1">
              Thông tin thẻ của bạn được mã hóa và bảo mật tuyệt đối. Chúng tôi
              không lưu trữ thông tin thẻ.
            </p>
          </div>
        )}

        {selectedMethod === "cod" && (
          <div className="mt-4 p-4 bg-amber-50 rounded-lg">
            <div className="flex items-center gap-2 text-amber-700">
              <Banknote className="h-4 w-4" />
              <span className="text-sm font-medium">Lưu ý thanh toán COD</span>
            </div>
            <p className="text-sm text-amber-600 mt-1">
              Vui lòng chuẩn bị đúng số tiền khi nhận hàng. Phí COD có thể được
              áp dụng tùy theo khu vực.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
