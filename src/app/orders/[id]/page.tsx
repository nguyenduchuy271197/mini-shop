import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import OrderDetailHeader from "../_components/order-detail-header";
import OrderDetailContent from "../_components/order-detail-content";
import OrderDetailLoading from "../_components/order-detail-loading";

interface OrderDetailPageProps {
  params: {
    id: string;
  };
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const supabase = createClient();

  // Check authentication
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/login?returnUrl=/orders");
  }

  const orderId = parseInt(params.id);

  if (isNaN(orderId)) {
    redirect("/orders");
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <OrderDetailHeader orderId={orderId} />

        <Suspense fallback={<OrderDetailLoading />}>
          <OrderDetailContent orderId={orderId} />
        </Suspense>
      </div>
    </div>
  );
}
