import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import PaymentContent from "../_components/payment-content";

interface PaymentPageProps {
  searchParams: {
    order?: string;
    method?: string;
  };
}

export default async function PaymentPage({ searchParams }: PaymentPageProps) {
  const supabase = createClient();

  // Check authentication
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/login");
  }

  const orderNumber = searchParams.order;
  const paymentMethod = searchParams.method;

  if (!orderNumber || !paymentMethod) {
    redirect("/dashboard/orders");
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Suspense fallback={<div>Đang tải...</div>}>
          <PaymentContent
            orderNumber={orderNumber}
            paymentMethod={paymentMethod}
          />
        </Suspense>
      </div>
    </div>
  );
}
