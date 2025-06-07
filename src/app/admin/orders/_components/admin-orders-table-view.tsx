"use client";

import {
  useAdminOrders,
  type OrderFilters,
  type OrderWithDetails,
} from "@/hooks/admin/orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Clock,
  CheckCircle,
  Truck,
  Package,
  XCircle,
  RefreshCw,
  User,
  Calendar,
  CreditCard,
} from "lucide-react";
import { AdminOrderDetailDialog } from "./admin-order-detail-dialog";
import { AdminOrderStatusUpdate } from "./admin-order-status-update";

interface AdminOrdersTableViewProps {
  filters: OrderFilters;
  page: number;
  onPageChange: (page: number) => void;
  selectedOrders: number[];
  onOrderSelection: (orderId: number, selected: boolean) => void;
  onBulkSelection: (orderIds: number[], selected: boolean) => void;
}

export function AdminOrdersTableView({
  filters,
  page,
  onPageChange,
  selectedOrders,
  onOrderSelection,
  onBulkSelection,
}: AdminOrdersTableViewProps) {
  const { data, isLoading, error } = useAdminOrders({
    pagination: { page, limit: 20 },
    filters,
    includeItems: false,
    includeCustomer: true,
  });

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        label: "Chờ xử lý",
        variant: "secondary" as const,
        icon: Clock,
        color: "text-yellow-600",
      },
      confirmed: {
        label: "Đã xác nhận",
        variant: "outline" as const,
        icon: CheckCircle,
        color: "text-blue-600",
      },
      processing: {
        label: "Đang xử lý",
        variant: "default" as const,
        icon: RefreshCw,
        color: "text-indigo-600",
      },
      shipped: {
        label: "Đã giao vận",
        variant: "outline" as const,
        icon: Truck,
        color: "text-purple-600",
      },
      delivered: {
        label: "Đã giao hàng",
        variant: "default" as const,
        icon: Package,
        color: "text-green-600",
      },
      cancelled: {
        label: "Đã hủy",
        variant: "destructive" as const,
        icon: XCircle,
        color: "text-red-600",
      },
      refunded: {
        label: "Đã hoàn tiền",
        variant: "outline" as const,
        icon: RefreshCw,
        color: "text-orange-600",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {config.label}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const paymentConfig = {
      pending: {
        label: "Chờ thanh toán",
        variant: "secondary" as const,
        color: "text-yellow-600",
      },
      paid: {
        label: "Đã thanh toán",
        variant: "default" as const,
        color: "text-green-600",
      },
      failed: {
        label: "Thất bại",
        variant: "destructive" as const,
        color: "text-red-600",
      },
      refunded: {
        label: "Đã hoàn tiền",
        variant: "outline" as const,
        color: "text-orange-600",
      },
    };

    const config =
      paymentConfig[status as keyof typeof paymentConfig] ||
      paymentConfig.pending;

    return (
      <Badge variant={config.variant} className="gap-1">
        <CreditCard className={`h-3 w-3 ${config.color}`} />
        {config.label}
      </Badge>
    );
  };

  const orders = data?.orders || [];
  const pagination = data?.pagination;

  const handleSelectAll = (checked: boolean) => {
    const currentOrderIds = orders.map((order) => order.id);
    onBulkSelection(currentOrderIds, checked);
  };

  const allSelected =
    orders.length > 0 &&
    orders.every((order) => selectedOrders.includes(order.id));
  const someSelected = orders.some((order) =>
    selectedOrders.includes(order.id)
  );

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">Lỗi: {error.message}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Danh sách đơn hàng
            {pagination && (
              <Badge variant="outline">{pagination.total} đơn hàng</Badge>
            )}
          </div>
          {isLoading && (
            <div className="text-sm text-gray-500">Đang tải...</div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                      className={
                        someSelected && !allSelected
                          ? "data-[state=checked]:bg-blue-600"
                          : ""
                      }
                    />
                  </TableHead>
                  <TableHead>Đơn hàng</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thanh toán</TableHead>
                  <TableHead className="text-right">Tổng tiền</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="w-24">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading skeleton
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(8)].map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-gray-500"
                    >
                      Không tìm thấy đơn hàng nào
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order: OrderWithDetails) => (
                    <TableRow key={order.id} className="hover:bg-gray-50">
                      <TableCell>
                        <Checkbox
                          checked={selectedOrders.includes(order.id)}
                          onCheckedChange={(checked) =>
                            onOrderSelection(order.id, checked as boolean)
                          }
                        />
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-blue-600">
                            #{order.order_number}
                          </div>
                          {order.items_count && (
                            <div className="text-xs text-gray-500">
                              {order.items_count} sản phẩm
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div className="space-y-1">
                            <div className="font-medium">
                              {order.customer?.full_name || "Khách vãng lai"}
                            </div>
                            {order.customer?.email && (
                              <div className="text-xs text-gray-500">
                                {order.customer.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>{getStatusBadge(order.status)}</TableCell>

                      <TableCell>
                        {getPaymentStatusBadge(order.payment_status)}
                      </TableCell>

                      <TableCell className="text-right font-medium">
                        {formatCurrency(order.total_amount)}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="h-3 w-3" />
                          {formatDate(order.created_at)}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1">
                          <AdminOrderDetailDialog order={order}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </AdminOrderDetailDialog>

                          <AdminOrderStatusUpdate order={order}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </AdminOrderStatusUpdate>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Hiển thị {(pagination.page - 1) * pagination.limit + 1} đến{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                của {pagination.total} đơn hàng
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Trước
                </Button>

                <div className="flex items-center gap-1">
                  <span className="text-sm">Trang</span>
                  <Select
                    value={pagination.page.toString()}
                    onValueChange={(value) => onPageChange(Number(value))}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(pagination.totalPages)].map((_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-sm">của {pagination.totalPages}</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Sau
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
