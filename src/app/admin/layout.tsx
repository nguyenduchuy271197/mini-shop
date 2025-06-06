import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản trị viên | Mini Shop",
  description: "Hệ thống quản trị Mini Shop",
};

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // Auth check - Kiểm tra user có phải admin không
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/login");
  }

  // Kiểm tra role admin
  const { data: userRole, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (roleError || !userRole || userRole.role !== "admin") {
    redirect("/dashboard"); // Redirect về customer dashboard nếu không phải admin
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main content */}
        <div className="flex-1 lg:ml-64">
          {/* Header */}
          <AdminHeader />

          {/* Page content */}
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
