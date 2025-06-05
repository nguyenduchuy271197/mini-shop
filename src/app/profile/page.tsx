import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/actions";
import ProfileTabs from "./_components/profile-tabs";

export default async function ProfilePage() {
  // Check authentication
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirectTo=/profile");
  }

  // Get user profile
  const profileResult = await getUserProfile();

  if (!profileResult.success) {
    redirect("/auth/login?message=session-expired");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Hồ sơ cá nhân
              </h1>
              <p className="mt-2 text-gray-600">
                Quản lý thông tin cá nhân và cài đặt tài khoản của bạn
              </p>
            </div>

            <Suspense fallback={<div>Đang tải...</div>}>
              <ProfileTabs initialProfile={profileResult.profile} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
