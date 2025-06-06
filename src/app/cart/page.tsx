import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CartHeader from "./_components/cart-header";
import CartItems from "./_components/cart-items";
import CartSummary from "./_components/cart-summary";

import { Skeleton } from "@/components/ui/skeleton";

export default async function CartPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CartHeader />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Suspense fallback={<CartItemsSkeleton />}>
            <CartItems />
          </Suspense>
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <Suspense fallback={<CartSummarySkeleton />}>
            <CartSummary />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function CartItemsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-20 w-20 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CartSummarySkeleton() {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <Skeleton className="h-6 w-1/2" />
      <div className="space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <hr />
        <div className="flex justify-between">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-5 w-1/4" />
        </div>
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
