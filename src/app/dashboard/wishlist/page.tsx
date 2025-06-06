import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import WishlistHeader from "./_components/wishlist-header";
import WishlistGrid from "./_components/wishlist-grid";

export default async function WishlistPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="space-y-6">
        <WishlistHeader />
        <Suspense fallback={<WishlistGridSkeleton />}>
          <WishlistGrid />
        </Suspense>
      </div>
    </div>
  );
}

function WishlistGridSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="border rounded-lg p-4 space-y-4 animate-pulse"
          >
            <div className="aspect-square bg-gray-200 rounded"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="flex space-x-2">
                <div className="h-8 bg-gray-200 rounded flex-1"></div>
                <div className="h-8 bg-gray-200 rounded w-8"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
