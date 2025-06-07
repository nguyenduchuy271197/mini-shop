"use client";

import { useState } from "react";
import {
  useBulkUpdateOrders,
  type OrderWithDetails,
} from "@/hooks/admin/orders";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Clock,
  CheckSquare,
  Truck,
  Package,
  XCircle,
  RefreshCw,
  Edit,
  AlertCircle,
} from "lucide-react";

interface AdminOrderStatusUpdateProps {
  order: OrderWithDetails;
  children: React.ReactNode;
}

export function AdminOrderStatusUpdate({
  order,
  children,
}: AdminOrderStatusUpdateProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(order.status);
  const [notes, setNotes] = useState("");
  const [notifyCustomers, setNotifyCustomers] = useState(true);
  const [trackingNumber, setTrackingNumber] = useState(
    order.tracking_number || ""
  );

  const bulkUpdateOrders = useBulkUpdateOrders({
    onSuccess: () => {
      setIsDialogOpen(false);
      setNotes("");
    },
  });

  const handleStatusUpdate = () => {
    if (!selectedStatus || selectedStatus === order.status) return;

    // Prepare update data
    const updateData = {
      orderIds: [order.id],
      status: selectedStatus as
        | "pending"
        | "confirmed"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "refunded",
      notes: notes || undefined,
      notifyCustomers,
    };

    // Add tracking number to notes if provided and status is shipped
    if (
      selectedStatus === "shipped" &&
      trackingNumber &&
      trackingNumber !== order.tracking_number
    ) {
      const trackingNote = `Mã vận đơn: ${trackingNumber}`;
      updateData.notes = notes ? `${notes}\n\n${trackingNote}` : trackingNote;
    }

    bulkUpdateOrders.mutate(updateData);
  };

  const statusOptions = [
    {
      value: "pending",
      label: "Chờ xử lý",
      icon: Clock,
      color: "text-yellow-600",
      description: "Đơn hàng đang chờ xử lý",
    },
    {
      value: "confirmed",
      label: "Đã xác nhận",
      icon: CheckSquare,
      color: "text-blue-600",
      description: "Đơn hàng đã được xác nhận",
    },
    {
      value: "processing",
      label: "Đang xử lý",
      icon: RefreshCw,
      color: "text-indigo-600",
      description: "Đang chuẩn bị hàng",
    },
    {
      value: "shipped",
      label: "Đã giao vận",
      icon: Truck,
      color: "text-purple-600",
      description: "Hàng đã được giao cho đơn vị vận chuyển",
    },
    {
      value: "delivered",
      label: "Đã giao hàng",
      icon: Package,
      color: "text-green-600",
      description: "Đã giao hàng thành công",
    },
    {
      value: "cancelled",
      label: "Đã hủy",
      icon: XCircle,
      color: "text-red-600",
      description: "Đơn hàng đã bị hủy",
    },
    {
      value: "refunded",
      label: "Đã hoàn tiền",
      icon: RefreshCw,
      color: "text-orange-600",
      description: "Đã hoàn lại tiền cho khách hàng",
    },
  ];

  const currentStatusOption = statusOptions.find(
    (option) => option.value === order.status
  );
  const selectedStatusOption = statusOptions.find(
    (option) => option.value === selectedStatus
  );

  const CurrentIcon = currentStatusOption?.icon || Clock;
  const SelectedIcon = selectedStatusOption?.icon || Clock;

  const getCurrentStatusBadge = () => {
    if (!currentStatusOption) return null;

    const variants = {
      pending: "secondary" as const,
      confirmed: "outline" as const,
      processing: "default" as const,
      shipped: "outline" as const,
      delivered: "default" as const,
      cancelled: "destructive" as const,
      refunded: "outline" as const,
    };

    return (
      <Badge
        variant={variants[order.status as keyof typeof variants] || "secondary"}
      >
        <CurrentIcon className="h-3 w-3 mr-1" />
        {currentStatusOption.label}
      </Badge>
    );
  };

  const isStatusChanged = selectedStatus !== order.status;
  const isShippedStatus = selectedStatus === "shipped";

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Cập nhật trạng thái đơn hàng
          </DialogTitle>
          <DialogDescription>Đơn hàng #{order.order_number}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Status */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-600 mb-2">
              Trạng thái hiện tại:
            </div>
            {getCurrentStatusBadge()}
          </div>

          {/* New Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Trạng thái mới</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => {
                  const Icon = option.icon;
                  const isCurrentStatus = option.value === order.status;

                  return (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      disabled={isCurrentStatus}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${option.color}`} />
                        <div>
                          <div className="flex items-center gap-2">
                            {option.label}
                            {isCurrentStatus && (
                              <Badge variant="outline" className="text-xs">
                                Hiện tại
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {option.description}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Tracking Number for Shipped Status */}
          {isShippedStatus && (
            <div className="space-y-2">
              <Label htmlFor="tracking">Mã vận đơn</Label>
              <Input
                id="tracking"
                placeholder="Nhập mã vận đơn..."
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
            </div>
          )}

          {/* Status Change Warning */}
          {isStatusChanged && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <div className="font-medium">Thay đổi trạng thái</div>
                <div>
                  Từ{" "}
                  <span className="font-medium">
                    {currentStatusOption?.label}
                  </span>{" "}
                  thành{" "}
                  <span className="font-medium">
                    {selectedStatusOption?.label}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú (tuỳ chọn)</Label>
            <Textarea
              id="notes"
              placeholder="Nhập ghi chú về việc cập nhật trạng thái..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Notify Customer */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="notify"
              checked={notifyCustomers}
              onCheckedChange={(checked) =>
                setNotifyCustomers(checked as boolean)
              }
            />
            <Label htmlFor="notify" className="text-sm font-normal">
              Gửi thông báo email cho khách hàng
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
            disabled={bulkUpdateOrders.isPending}
          >
            Hủy
          </Button>
          <Button
            onClick={handleStatusUpdate}
            disabled={!isStatusChanged || bulkUpdateOrders.isPending}
          >
            {bulkUpdateOrders.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Đang cập nhật...
              </>
            ) : (
              <>
                <SelectedIcon className="h-4 w-4 mr-2" />
                Cập nhật trạng thái
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
