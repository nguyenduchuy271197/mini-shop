import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SuccessContent from "./_components/success-content";

interface SuccessPageProps {
  searchParams: {
    order?: string;
    session_id?: string;
  };
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const supabase = createClient();

  // Check authentication
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/login");
  }

  const { order: orderNumber, session_id: sessionId } = searchParams;

  if (!orderNumber) {
    redirect("/");
  }

  // Get order details
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (
        id,
        product_id,
        product_name,
        quantity,
        unit_price,
        total_price
      ),
      payments (
        id,
        payment_method,
        amount,
        status,
        stripe_session_id
      )
    `
    )
    .eq("order_number", orderNumber)
    .eq("user_id", user.id)
    .single();

  if (orderError || !order) {
    redirect("/");
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Suspense
          fallback={
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-gray-600">Đang xử lý...</p>
            </div>
          }
        >
          <SuccessContent order={order} sessionId={sessionId} />
        </Suspense>
      </div>
    </div>
  );
}
