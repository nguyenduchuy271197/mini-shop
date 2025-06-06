import { createClient } from "@/lib/supabase/server";
import { AdminUserMenu } from "./admin-user-menu";
import { AdminMobileNav } from "./admin-mobile-nav";
import { Bell } from "lucide-react";

export async function AdminHeader() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user profile
  const { data: profile } = user?.id
    ? await supabase.from("profiles").select("*").eq("id", user.id).single()
    : { data: null };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Mobile navigation toggle */}
        <div className="lg:hidden">
          <AdminMobileNav />
        </div>

        {/* Page title - will be updated by individual pages */}
        <div className="hidden lg:block">
          <h1 className="text-2xl font-semibold text-gray-900">
            Bảng điều khiển
          </h1>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button
            type="button"
            className="relative rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <span className="sr-only">Xem thông báo</span>
            <Bell className="h-6 w-6" />
            {/* Notification badge */}
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              3
            </span>
          </button>

          {/* User menu */}
          <AdminUserMenu user={user} profile={profile} />
        </div>
      </div>
    </header>
  );
}
