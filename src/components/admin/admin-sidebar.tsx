"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ShoppingBag,
  Tag,
  Users,
  ClipboardList,
  CreditCard,
  BarChart3,
  Gift,
  Truck,
  MessageSquare,
  Megaphone,
} from "lucide-react";

const adminMenuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: Home,
    description: "Tổng quan hệ thống",
  },
  {
    title: "Quản lý Catalog",
    icon: ShoppingBag,
    items: [
      {
        title: "Danh mục sản phẩm",
        href: "/admin/categories",
        description: "FR25",
      },
      { title: "Sản phẩm", href: "/admin/products", description: "FR26" },
      { title: "Kho hàng", href: "/admin/inventory", description: "FR27" },
    ],
  },
  {
    title: "Quản lý Đơn hàng",
    href: "/admin/orders",
    icon: ClipboardList,
    description: "FR28",
  },
  {
    title: "Quản lý Khách hàng",
    href: "/admin/customers",
    icon: Users,
    description: "FR29",
  },
  {
    title: "Quản lý Thanh toán",
    href: "/admin/payments",
    icon: CreditCard,
    description: "FR30",
  },
  {
    title: "Báo cáo",
    icon: BarChart3,
    items: [
      {
        title: "Báo cáo doanh thu",
        href: "/admin/reports/revenue",
        description: "FR32",
      },
      {
        title: "Sản phẩm bán chạy",
        href: "/admin/reports/products",
        description: "FR33",
      },
      {
        title: "Xuất báo cáo",
        href: "/admin/reports/export",
        description: "FR37",
      },
    ],
  },
  {
    title: "Marketing",
    icon: Megaphone,
    items: [
      { title: "Khuyến mãi", href: "/admin/promotions", description: "FR34" },
      {
        title: "Banner/Quảng cáo",
        href: "/admin/banners",
        description: "FR38",
      },
    ],
  },
  {
    title: "Vận chuyển",
    href: "/admin/shipping",
    icon: Truck,
    description: "FR35",
  },
  {
    title: "Quản lý nội dung",
    icon: MessageSquare,
    items: [
      {
        title: "Đánh giá sản phẩm",
        href: "/admin/reviews",
        description: "FR36",
      },
    ],
  },
];

interface AdminSidebarProps {
  className?: string;
}

export function AdminSidebar({ className = "" }: AdminSidebarProps) {
  return (
    <aside
      className={`bg-white shadow-lg w-64 fixed left-0 top-0 h-full overflow-y-auto lg:block hidden ${className}`}
    >
      {/* Logo */}
      <div className="p-6 border-b">
        <Link href="/admin" className="flex items-center space-x-2">
          <ShoppingBag className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">
            Mini Shop Admin
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="mt-6">
        <div className="px-4 space-y-2">
          {adminMenuItems.map((item, index) => (
            <AdminMenuItem key={index} item={item} />
          ))}
        </div>
      </nav>
    </aside>
  );
}

interface AdminMenuItemProps {
  item: {
    title: string;
    href?: string;
    icon: React.ComponentType<{ className?: string }>;
    description?: string;
    items?: Array<{
      title: string;
      href: string;
      description?: string;
    }>;
  };
}

function AdminMenuItem({ item }: AdminMenuItemProps) {
  const pathname = usePathname();
  const Icon = item.icon;

  // Nếu có sub-items thì render collapsible menu
  if (item.items) {
    return (
      <div className="space-y-1">
        <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100">
          <Icon className="mr-3 h-5 w-5" />
          <span>{item.title}</span>
        </div>
        <div className="ml-6 space-y-1">
          {item.items.map((subItem, index) => (
            <Link
              key={index}
              href={subItem.href}
              className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                pathname === subItem.href
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {subItem.title}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // Single menu item
  return (
    <Link
      href={item.href!}
      className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
        pathname === item.href
          ? "bg-blue-100 text-blue-700"
          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      <Icon className="mr-3 h-5 w-5" />
      <span>{item.title}</span>
    </Link>
  );
}
