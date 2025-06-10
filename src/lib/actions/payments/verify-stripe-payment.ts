"use server";

import { createClient } from "@/lib/supabase/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export async function verifyStripePayment(sessionId: string) {
  const supabase = createClient();

  try {
    // Get session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      throw new Error("Session not found");
    }

    // Get payment record from database
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("*, orders(*)")
      .eq("stripe_session_id", sessionId)
      .single();

    if (paymentError || !payment) {
      throw new Error("Payment record not found");
    }

    // Update payment status based on Stripe session status
    let paymentStatus = "pending";
    let orderStatus = "pending";
    let orderPaymentStatus = "pending";

    switch (session.payment_status) {
      case "paid":
        paymentStatus = "completed";
        orderStatus = "confirmed";
        orderPaymentStatus = "paid";
        break;
      case "unpaid":
        paymentStatus = "failed";
        orderPaymentStatus = "failed";
        break;
      case "no_payment_required":
        paymentStatus = "completed";
        orderStatus = "confirmed";
        orderPaymentStatus = "paid";
        break;
    }

    // Update payment record
    const { error: updatePaymentError } = await supabase
      .from("payments")
      .update({
        status: paymentStatus,
        transaction_id: session.payment_intent as string,
        stripe_payment_intent_id: session.payment_intent as string,
        processed_at: paymentStatus === "completed" ? new Date().toISOString() : null,
        gateway_response: session as any,
      })
      .eq("id", payment.id);

    if (updatePaymentError) {
      console.error("Error updating payment:", updatePaymentError);
      throw new Error("Failed to update payment");
    }

    // Update order status
    const { error: updateOrderError } = await supabase
      .from("orders")
      .update({
        status: orderStatus,
        payment_status: orderPaymentStatus,
      })
      .eq("id", payment.order_id);

    if (updateOrderError) {
      console.error("Error updating order:", updateOrderError);
      throw new Error("Failed to update order");
    }

    return {
      success: true,
      paymentStatus,
      orderStatus,
      sessionStatus: session.payment_status,
    };
  } catch (error) {
    console.error("Error verifying Stripe payment:", error);
    throw new Error("Failed to verify payment");
  }
}

export async function getStripePaymentStatus(sessionId: string) {
  const supabase = createClient();

  try {
    // Get payment record from database
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("*, orders(*)")
      .eq("stripe_session_id", sessionId)
      .single();

    if (paymentError || !payment) {
      return { success: false, error: "Payment not found" };
    }

    return {
      success: true,
      payment,
      order: payment.orders,
    };
  } catch (error) {
    console.error("Error getting payment status:", error);
    return { success: false, error: "Failed to get payment status" };
  }
} 