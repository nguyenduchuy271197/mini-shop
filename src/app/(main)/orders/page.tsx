import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import OrdersHeader from "./_components/orders-header";
import OrdersList from "./_components/orders-list";
import OrdersLoading from "./_components/orders-loading";

export default async function OrdersPage() {
  const supabase = createClient();

  // Check authentication
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/login?returnUrl=/orders");
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <OrdersHeader />

        <Suspense fallback={<OrdersLoading />}>
          <OrdersList />
        </Suspense>
      </div>
    </div>
  );
}
