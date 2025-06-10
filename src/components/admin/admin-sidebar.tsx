"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ShoppingBag,
  Users,
  ClipboardList,
  CreditCard,
  BarChart3,
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
      },
      { title: "Sản phẩm", href: "/admin/products" },
      { title: "Kho hàng", href: "/admin/inventory" },
    ],
  },
  {
    title: "Quản lý Đơn hàng",
    href: "/admin/orders",
    icon: ClipboardList,
  },
  {
    title: "Quản lý Khách hàng",
    href: "/admin/customers",
    icon: Users,
  },
  {
    title: "Quản lý Thanh toán",
    href: "/admin/payments",
    icon: CreditCard,
  },
  {
    title: "Báo cáo",
    icon: BarChart3,
    items: [
      {
        title: "Báo cáo doanh thu",
        href: "/admin/reports/revenue",
      },
      {
        title: "Sản phẩm bán chạy",
        href: "/admin/reports/products",
      },
    ],
  },
  {
    title: "Marketing",
    icon: Megaphone,
    items: [{ title: "Khuyến mãi", href: "/admin/promotions" }],
  },
  {
    title: "Quản lý nội dung",
    icon: MessageSquare,
    items: [
      {
        title: "Đánh giá sản phẩm",
        href: "/admin/reviews",
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
          <span className="text-xl font-bold text-gray-900">Admin</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="py-6">
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
