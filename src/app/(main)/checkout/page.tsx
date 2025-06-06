import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CheckoutHeader from "./_components/checkout-header";
import CheckoutForm from "./_components/checkout-form";
import CheckoutSummary from "./_components/checkout-summary";

export default async function CheckoutPage() {
  const supabase = createClient();

  // Check authentication
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/login?returnUrl=/checkout");
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <CheckoutHeader />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <CheckoutForm />
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <CheckoutSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
