import { createClient } from "@/lib/supabase/server";
import { Folder, Eye, Hash, Calendar } from "lucide-react";

export async function AdminCategoriesStats() {
  const supabase = createClient();

  // Get categories statistics
  const [
    { count: totalCategories },
    { count: activeCategories },
    { count: inactiveCategories },
  ] = await Promise.all([
    supabase.from("categories").select("*", { count: "exact", head: true }),
    supabase
      .from("categories")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("categories")
      .select("*", { count: "exact", head: true })
      .eq("is_active", false),
  ]);

  const stats = [
    {
      title: "Tổng danh mục",
      value: totalCategories || 0,
      icon: Hash,
      color: "bg-blue-500",
    },
    {
      title: "Đang hoạt động",
      value: activeCategories || 0,
      icon: Eye,
      color: "bg-green-500",
    },
    {
      title: "Tạm dừng",
      value: inactiveCategories || 0,
      icon: Folder,
      color: "bg-orange-500",
    },
    {
      title: "Tỉ lệ hoạt động",
      value: totalCategories
        ? `${Math.round(((activeCategories || 0) / totalCategories) * 100)}%`
        : "0%",
      icon: Calendar,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
