"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCreateOrder, type CreateOrderData } from "@/hooks/orders";
import { useCart, useCartTotal } from "@/hooks/cart";
import { useToast } from "@/hooks/use-toast";
import AddressSelection from "./address-selection";
import PaymentMethodSelection from "./payment-method-selection";
import OrderNotes from "./order-notes";
import ShippingMethodSelection from "./shipping-method-selection";
import type { AddressData } from "@/types/custom.types";

export default function CheckoutForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: cartData } = useCart();
  const { data: cartTotalData } = useCartTotal();
  const createOrder = useCreateOrder();

  const [selectedShippingAddress, setSelectedShippingAddress] =
    useState<AddressData | null>(null);
  const [selectedBillingAddress, setSelectedBillingAddress] =
    useState<AddressData | null>(null);
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [selectedShippingMethod, setSelectedShippingMethod] =
    useState("standard");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cod");
  const [orderNotes, setOrderNotes] = useState("");
  const [couponCode] = useState("");

  const handleSubmitOrder = async () => {
    if (!selectedShippingAddress) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn địa chỉ giao hàng",
        variant: "destructive",
      });
      return;
    }

    if (!cartData?.cartItems || cartData.cartItems.length === 0) {
      toast({
        title: "Lỗi",
        description: "Giỏ hàng của bạn đang trống",
        variant: "destructive",
      });
      return;
    }

    const billingAddress = useSameAddress
      ? selectedShippingAddress
      : selectedBillingAddress;

    if (!billingAddress) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn địa chỉ thanh toán",
        variant: "destructive",
      });
      return;
    }

    const orderData: CreateOrderData = {
      shipping_address: selectedShippingAddress,
      billing_address: billingAddress,
      shipping_method: selectedShippingMethod,
      coupon_code: couponCode || undefined,
      notes: orderNotes || undefined,
      order_items: cartData.cartItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })),
    };

    createOrder.mutate(orderData, {
      onSuccess: (result) => {
        if (result.success && result.order) {
          // Redirect to payment or success page based on payment method
          if (selectedPaymentMethod === "cod") {
            router.push(`/checkout/success?order=${result.order.order_number}`);
          } else {
            router.push(
              `/checkout/payment?order=${result.order.order_number}&method=${selectedPaymentMethod}`
            );
          }
        }
      },
    });
  };

  const isFormValid =
    selectedShippingAddress && (useSameAddress || selectedBillingAddress);

  return (
    <div className="space-y-6">
      {/* Shipping Address */}
      <Card>
        <CardHeader>
          <CardTitle>Địa chỉ giao hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <AddressSelection
            selectedAddress={selectedShippingAddress}
            onAddressSelect={setSelectedShippingAddress}
            type="shipping"
          />
        </CardContent>
      </Card>

      {/* Billing Address */}
      <Card>
        <CardHeader>
          <CardTitle>Địa chỉ thanh toán</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={useSameAddress}
                onChange={(e) => setUseSameAddress(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Sử dụng cùng địa chỉ giao hàng</span>
            </label>

            {!useSameAddress && (
              <AddressSelection
                selectedAddress={selectedBillingAddress}
                onAddressSelect={setSelectedBillingAddress}
                type="billing"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Shipping Method */}
      <Card>
        <CardHeader>
          <CardTitle>Phương thức vận chuyển</CardTitle>
        </CardHeader>
        <CardContent>
          <ShippingMethodSelection
            selectedMethod={selectedShippingMethod}
            onMethodSelect={setSelectedShippingMethod}
          />
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Phương thức thanh toán</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentMethodSelection
            selectedMethod={selectedPaymentMethod}
            onMethodSelect={setSelectedPaymentMethod}
          />
        </CardContent>
      </Card>

      {/* Order Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Ghi chú đơn hàng (Tùy chọn)</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderNotes notes={orderNotes} onNotesChange={setOrderNotes} />
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={handleSubmitOrder}
            disabled={!isFormValid || createOrder.isPending}
            className="w-full"
            size="lg"
          >
            {createOrder.isPending ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang xử lý...
              </div>
            ) : (
              `Đặt hàng • ${
                cartTotalData?.breakdown?.total
                  ? new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(cartTotalData.breakdown.total)
                  : "..."
              }`
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
