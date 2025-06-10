import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@13.11.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
  apiVersion: "2023-10-16",
});

const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") as string;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Manual signature verification function for Deno compatibility
async function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const elements = signature.split(",");
  let timestamp: string | null = null;
  let v1: string | null = null;

  for (const element of elements) {
    const [key, value] = element.split("=");
    if (key === "t") timestamp = value;
    if (key === "v1") v1 = value;
  }

  if (!timestamp || !v1) {
    return false;
  }

  // Check timestamp (within 5 minutes)
  const currentTime = Math.floor(Date.now() / 1000);
  const requestTime = parseInt(timestamp);
  if (Math.abs(currentTime - requestTime) > 300) {
    return false;
  }

  // Verify signature
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const dataToSign = encoder.encode(`${timestamp}.${payload}`);
  
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature_bytes = await crypto.subtle.sign("HMAC", cryptoKey, dataToSign);
  const expected = Array.from(new Uint8Array(signature_bytes))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  return expected === v1;
}

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response("No signature found", { status: 400 });
  }

  try {
    // Get the raw body for signature verification
    const bodyBytes = await req.arrayBuffer();
    const body = new TextDecoder().decode(bodyBytes);
    
    // Verify the signature manually
    const isValid = await verifyStripeSignature(body, signature, webhookSecret);
    if (!isValid) {
      console.error("Invalid webhook signature");
      return new Response("Invalid signature", { status: 400 });
    }

    // Parse the event
    const event = JSON.parse(body) as Stripe.Event;
    console.log(`Received Stripe webhook: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }
      
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      }
      
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentFailed(paymentIntent);
        break;
      }
      
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error processing webhook:", err);
    return new Response(`Webhook error: ${err.message}`, { status: 400 });
  }
});

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log("Processing checkout session completed:", session.id);
  
  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select("*, orders(*)")
    .eq("stripe_session_id", session.id)
    .single();

  if (paymentError) {
    console.error("Error finding payment:", paymentError);
    return;
  }

  if (!payment) {
    console.error("Payment not found for session:", session.id);
    return;
  }

  // Update payment status
  const { error: updatePaymentError } = await supabase
    .from("payments")
    .update({
      status: "completed",
      transaction_id: session.payment_intent as string,
      stripe_payment_intent_id: session.payment_intent as string,
      processed_at: new Date().toISOString(),
      gateway_response: session as any,
    })
    .eq("id", payment.id);

  if (updatePaymentError) {
    console.error("Error updating payment:", updatePaymentError);
    return;
  }

  // Update order status
  const { error: updateOrderError } = await supabase
    .from("orders")
    .update({
      payment_status: "paid",
      status: "confirmed",
    })
    .eq("id", payment.order_id);

  if (updateOrderError) {
    console.error("Error updating order:", updateOrderError);
    return;
  }

  console.log("Successfully processed checkout session completed");
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log("Processing payment intent succeeded:", paymentIntent.id);
  
  // First try to find payment by payment intent ID
  let { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select("*, orders(*)")
    .eq("stripe_payment_intent_id", paymentIntent.id)
    .single();

  // If not found, try to find by session ID from metadata or other means
  if (paymentError || !payment) {
    console.log("Payment not found by payment intent ID, trying to find by session...");
    
    // Try to find the payment by checking if this payment intent is associated with any session
    const { data: sessionPayment, error: sessionError } = await supabase
      .from("payments")
      .select("*, orders(*)")
      .eq("transaction_id", paymentIntent.id)
      .single();

    if (sessionError || !sessionPayment) {
      console.log("Payment still not found, this might be a standalone payment intent");
      return;
    }
    
    payment = sessionPayment;
  }

  // Update payment with final details
  const { error: updateError } = await supabase
    .from("payments")
    .update({
      status: "completed",
      stripe_payment_intent_id: paymentIntent.id,
      processed_at: new Date().toISOString(),
      gateway_response: paymentIntent as any,
    })
    .eq("id", payment.id);

  if (updateError) {
    console.error("Error updating payment:", updateError);
    return;
  }

  console.log("Successfully processed payment intent succeeded");
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log("Processing payment intent failed:", paymentIntent.id);
  
  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select("*, orders(*)")
    .eq("stripe_payment_intent_id", paymentIntent.id)
    .single();

  if (paymentError || !payment) {
    console.log("Payment not found or error:", paymentError);
    return;
  }

  // Update payment status to failed
  const { error: updatePaymentError } = await supabase
    .from("payments")
    .update({
      status: "failed",
      gateway_response: paymentIntent as any,
    })
    .eq("id", payment.id);

  if (updatePaymentError) {
    console.error("Error updating payment:", updatePaymentError);
    return;
  }

  // Update order payment status
  const { error: updateOrderError } = await supabase
    .from("orders")
    .update({
      payment_status: "failed",
    })
    .eq("id", payment.order_id);

  if (updateOrderError) {
    console.error("Error updating order:", updateOrderError);
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log("Processing invoice payment succeeded:", invoice.id);
  // Handle subscription or recurring payment logic here
} 