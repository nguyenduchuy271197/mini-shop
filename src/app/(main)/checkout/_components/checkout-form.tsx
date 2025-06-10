"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCreateOrder, type CreateOrderData } from "@/hooks/orders";
import { useCart, useCartTotal } from "@/hooks/cart";
import { useCreateStripeCheckout } from "@/hooks/payments/use-stripe-checkout";
import { useToast } from "@/hooks/use-toast";
import AddressSelection from "./address-selection";
import PaymentMethodSelector from "./payment-method-selector";
import OrderNotes from "./order-notes";
import ShippingMethodSelection from "./shipping-method-selection";
import { useCheckoutContext } from "./checkout-context";
import type { AddressData, PaymentMethod } from "@/types/custom.types";

export default function CheckoutForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { selectedShippingMethod, setSelectedShippingMethod } =
    useCheckoutContext();
  const { data: cartData } = useCart();
  const { data: cartTotalData } = useCartTotal({
    shippingMethod: selectedShippingMethod,
  });
  const createOrder = useCreateOrder();
  const createStripeCheckout = useCreateStripeCheckout();

  const [selectedShippingAddress, setSelectedShippingAddress] =
    useState<AddressData | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>("stripe");
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

    // Use shipping address as billing address
    const orderData: CreateOrderData = {
      shipping_address: selectedShippingAddress,
      billing_address: selectedShippingAddress,
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
          // Handle different payment methods
          if (selectedPaymentMethod === "stripe") {
            // Create Stripe checkout session
            const totalAmount = cartTotalData?.breakdown?.total || 0;
            createStripeCheckout.mutate({
              orderId: result.order.id,
              amount: totalAmount,
              currency: "VND",
              successUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order=${result.order.order_number}`,
              cancelUrl: `${window.location.origin}/checkout?cancelled=true`,
              metadata: {
                orderNumber: result.order.order_number,
                shippingMethod: selectedShippingMethod,
              },
            });
          } else if (selectedPaymentMethod === "cod") {
            router.push(`/checkout/success?order=${result.order.order_number}`);
          } else {
            // For other payment methods (VNPay, MoMo, etc.), redirect to success page
            // In a real implementation, you would redirect to their respective payment gateways
            router.push(`/checkout/success?order=${result.order.order_number}`);
          }
        }
      },
    });
  };

  const isFormValid = selectedShippingAddress;

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

      {/* Shipping Method */}
      <Card>
        <CardHeader>
          <CardTitle>Phương thức vận chuyển</CardTitle>
        </CardHeader>
        <CardContent>
          <ShippingMethodSelection
            selectedMethod={selectedShippingMethod}
            onMethodSelect={setSelectedShippingMethod}
            cartSubtotal={cartData?.summary?.subtotal || 0}
          />
        </CardContent>
      </Card>

      {/* Payment Method */}
      <PaymentMethodSelector
        selectedMethod={selectedPaymentMethod}
        onMethodChange={setSelectedPaymentMethod}
      />

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
