import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ReviewsHeader } from "./_components/reviews-header";
import { ReviewsList } from "./_components/reviews-list";

export default async function ReviewsPage() {
  // Auth check
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="space-y-6">
        <ReviewsHeader />
        <ReviewsList />
      </div>
    </div>
  );
}
