"use client";

import { useState } from "react";
import { useBulkUpdateOrders } from "@/hooks/admin/orders";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckSquare,
  X,
  Clock,
  Truck,
  Package,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";

interface AdminOrdersBulkActionsProps {
  selectedOrders: number[];
  onClearSelection: () => void;
}

export function AdminOrdersBulkActions({
  selectedOrders,
  onClearSelection,
}: AdminOrdersBulkActionsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [notifyCustomers, setNotifyCustomers] = useState(false);

  const bulkUpdateOrders = useBulkUpdateOrders({
    onSuccess: () => {
      setIsDialogOpen(false);
      onClearSelection();
      setSelectedStatus("");
      setNotes("");
      setNotifyCustomers(false);
    },
  });

  const handleBulkUpdate = () => {
    if (!selectedStatus || selectedOrders.length === 0) return;

    bulkUpdateOrders.mutate({
      orderIds: selectedOrders,
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
    });
  };

  const statusOptions = [
    {
      value: "confirmed",
      label: "Xác nhận đơn hàng",
      icon: CheckSquare,
      color: "text-green-600",
    },
    {
      value: "processing",
      label: "Đang xử lý",
      icon: Clock,
      color: "text-blue-600",
    },
    {
      value: "shipped",
      label: "Đã giao vận",
      icon: Truck,
      color: "text-indigo-600",
    },
    {
      value: "delivered",
      label: "Đã giao hàng",
      icon: Package,
      color: "text-green-600",
    },
    {
      value: "cancelled",
      label: "Hủy đơn hàng",
      icon: XCircle,
      color: "text-red-600",
    },
    {
      value: "refunded",
      label: "Hoàn tiền",
      icon: RefreshCw,
      color: "text-orange-600",
    },
  ];

  const selectedStatusOption = statusOptions.find(
    (option) => option.value === selectedStatus
  );
  const StatusIcon = selectedStatusOption?.icon || CheckCircle;

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckSquare className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-900">
              Đã chọn {selectedOrders.length} đơn hàng
            </span>
            <Badge variant="secondary">{selectedOrders.length}</Badge>
          </div>

          <div className="flex items-center gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" size="sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Cập nhật trạng thái
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <StatusIcon className="h-5 w-5" />
                    Cập nhật trạng thái đơn hàng
                  </DialogTitle>
                  <DialogDescription>
                    Cập nhật trạng thái cho {selectedOrders.length} đơn hàng đã
                    chọn
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Trạng thái mới</Label>
                    <Select
                      value={selectedStatus}
                      onValueChange={setSelectedStatus}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => {
                          const Icon = option.icon;
                          return (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                <Icon className={`h-4 w-4 ${option.color}`} />
                                {option.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Ghi chú (tuỳ chọn)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Nhập ghi chú cho việc cập nhật trạng thái..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="notify"
                      checked={notifyCustomers}
                      onCheckedChange={(checked) =>
                        setNotifyCustomers(checked as boolean)
                      }
                    />
                    <Label htmlFor="notify" className="text-sm font-normal">
                      Gửi thông báo đến khách hàng
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
                    onClick={handleBulkUpdate}
                    disabled={!selectedStatus || bulkUpdateOrders.isPending}
                  >
                    {bulkUpdateOrders.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Đang cập nhật...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Cập nhật {selectedOrders.length} đơn hàng
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button variant="outline" size="sm" onClick={onClearSelection}>
              <X className="h-4 w-4 mr-2" />
              Bỏ chọn
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
