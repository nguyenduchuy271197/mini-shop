import { Users, UserCheck, Crown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerMetrics } from "../_lib/utils";
import { formatCurrency } from "@/lib/utils";

interface AdminCustomersStatsProps {
  metrics?: CustomerMetrics;
  isLoading?: boolean;
}

export function AdminCustomersStats({
  metrics,
  isLoading = false,
}: AdminCustomersStatsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded mb-1" />
              <div className="h-3 w-24 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) return null;

  const stats = [
    {
      title: "Tổng khách hàng",
      value: metrics.totalCustomers.toLocaleString(),
      icon: Users,
      description: "Tổng số khách hàng đăng ký",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Khách hàng mới",
      value: metrics.newCustomersThisMonth.toLocaleString(),
      icon: UserCheck,
      description: "Khách hàng mới tháng này",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Khách hàng VIP",
      value: metrics.vipCustomers.toLocaleString(),
      icon: Crown,
      description: "Khách hàng thân thiết",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "AOV trung bình",
      value: formatCurrency(metrics.averageOrderValue),
      icon: TrendingUp,
      description: "Giá trị đơn hàng trung bình",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
