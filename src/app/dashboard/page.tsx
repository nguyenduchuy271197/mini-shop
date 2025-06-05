import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/actions";
import DashboardContent from "./_components/dashboard-content";

export default async function DashboardPage() {
  // Check authentication
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirectTo=/dashboard");
  }

  // Get user profile
  const profileResult = await getUserProfile();

  if (!profileResult.success) {
    redirect("/auth/login?message=session-expired");
  }

  return <DashboardContent profile={profileResult.profile} />;
}
