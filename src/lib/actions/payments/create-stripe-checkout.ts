"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Stripe from "stripe";
import { StripeCheckoutData, StripeSessionResponse } from "@/types/custom.types";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function createStripeCheckout(
  checkoutData: StripeCheckoutData
): Promise<StripeSessionResponse> {
  const supabase = createClient();

  // Check authentication
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/login");
  }

  try {
    // Get order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          id,
          product_id,
          product_name,
          quantity,
          unit_price,
          total_price
        )
      `)
      .eq("id", checkoutData.orderId)
      .eq("user_id", user.id)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found or access denied");
    }

    // Convert VND to cents (Stripe requires smallest currency unit)
    const amountInCents = Math.round(checkoutData.amount);

    // Create line items for Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = 
      order.order_items.map((item) => ({
        price_data: {
          currency: checkoutData.currency.toLowerCase(),
          product_data: {
            name: item.product_name,
          },
          unit_amount: Math.round(item.unit_price),
        },
        quantity: item.quantity,
      }));

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: checkoutData.successUrl,
      cancel_url: checkoutData.cancelUrl,
      metadata: {
        orderId: checkoutData.orderId.toString(),
        userId: user.id,
        ...checkoutData.metadata,
      },
      customer_email: user.email,
      billing_address_collection: "auto",
      shipping_address_collection: {
        allowed_countries: ["VN", "US", "GB"], // Add more countries as needed
      },
    });

    if (!session.id || !session.url) {
      throw new Error("Failed to create Stripe session");
    }

    // Create payment record
    const { error: paymentError } = await supabase
      .from("payments")
      .insert({
        order_id: checkoutData.orderId,
        payment_method: "stripe",
        payment_provider: "Stripe",
        amount: checkoutData.amount,
        currency: checkoutData.currency,
        status: "pending",
        stripe_session_id: session.id,
      });

    if (paymentError) {
      console.error("Error creating payment record:", paymentError);
      throw new Error("Failed to create payment record");
    }

    return {
      sessionId: session.id,
      url: session.url,
    };
  } catch (error) {
    console.error("Error creating Stripe checkout:", error);
    throw new Error("Failed to create checkout session");
  }
} 