"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PaymentWithDetails } from "@/hooks/admin/payments";
import { formatCurrency } from "@/lib/utils";
import {
  getPaymentStatusBadgeVariant,
  getPaymentStatusText,
  getPaymentMethodText,
  getPaymentMethodIcon,
  formatPaymentDate,
} from "../_lib/utils";
import {
  CreditCard,
  User,
  Package,
  Calendar,
  Hash,
  DollarSign,
} from "lucide-react";

interface AdminPaymentDetailDialogProps {
  payment: PaymentWithDetails | null;
  open: boolean;
  onClose: () => void;
}

export function AdminPaymentDetailDialog({
  payment,
  open,
  onClose,
}: AdminPaymentDetailDialogProps) {
  if (!payment) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chi tiết thanh toán</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-muted-foreground">
              Không có thông tin thanh toán
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Chi tiết thanh toán #{payment.id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thông tin giao dịch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Mã giao dịch
                    </span>
                  </div>
                  <p className="font-mono text-sm">
                    {payment.transaction_id || `#${payment.id}`}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Số tiền
                    </span>
                  </div>
                  <p className="text-lg font-semibold">
                    {formatCurrency(payment.amount)}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">
                    Phương thức thanh toán
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {getPaymentMethodIcon(payment.payment_method)}
                    </span>
                    <span>{getPaymentMethodText(payment.payment_method)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">
                    Trạng thái
                  </span>
                  <Badge variant={getPaymentStatusBadgeVariant(payment.status)}>
                    {getPaymentStatusText(payment.status)}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Ngày tạo
                    </span>
                  </div>
                  <p className="text-sm">
                    {formatPaymentDate(payment.created_at)}
                  </p>
                </div>

                {payment.processed_at && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Ngày xử lý
                      </span>
                    </div>
                    <p className="text-sm">
                      {formatPaymentDate(payment.processed_at)}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Information */}
          {payment.order && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Thông tin đơn hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">
                      Mã đơn hàng
                    </span>
                    <p className="font-medium">{payment.order.order_number}</p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">
                      ID đơn hàng
                    </span>
                    <p className="text-sm">{payment.order.id}</p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">
                      Tổng giá trị đơn hàng
                    </span>
                    <p className="font-medium">
                      {formatCurrency(payment.order.total_amount)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">
                      ID khách hàng
                    </span>
                    <p className="text-sm">{payment.order.user_id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Customer Information */}
          {payment.order?.customer && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Thông tin khách hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">
                      Họ và tên
                    </span>
                    <p className="font-medium">
                      {payment.order.customer.full_name}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Email</span>
                    <p className="text-sm">{payment.order.customer.email}</p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">
                      ID khách hàng
                    </span>
                    <p className="text-sm">{payment.order.customer.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Chi tiết kỹ thuật</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {payment.gateway_response && (
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">
                      Phản hồi từ cổng thanh toán
                    </span>
                    <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                      {typeof payment.gateway_response === "string"
                        ? payment.gateway_response
                        : JSON.stringify(payment.gateway_response, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                  <div className="space-y-1">
                    <span>Thời gian tạo:</span>
                    <p>{new Date(payment.created_at).toISOString()}</p>
                  </div>

                  <div className="space-y-1">
                    <span>Thời gian cập nhật:</span>
                    <p>{new Date(payment.updated_at).toISOString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
