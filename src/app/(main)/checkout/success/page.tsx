import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import CheckoutSuccessContent from "../_components/checkout-success-content";

interface CheckoutSuccessPageProps {
  searchParams: {
    order?: string;
  };
}

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
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

  if (!orderNumber) {
    redirect("/dashboard/orders");
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Suspense fallback={<div>Đang tải...</div>}>
          <CheckoutSuccessContent orderNumber={orderNumber} />
        </Suspense>
      </div>
    </div>
  );
}
