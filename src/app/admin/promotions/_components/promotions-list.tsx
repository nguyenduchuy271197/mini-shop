"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAdminCoupons, useDeleteCoupon } from "@/hooks/admin/coupons";
import {
  getCouponStatusText,
  formatCouponValue,
  formatUsageLimit,
  couponStatusOptions,
} from "../_lib/utils";
import { formatDate } from "@/lib/utils";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Eye,
} from "lucide-react";
import { AdminCreateCouponDialog } from "./admin-create-coupon-dialog";
import { AdminEditCouponDialog } from "./admin-edit-coupon-dialog";
import { AdminCouponDetailDialog } from "./admin-coupon-detail-dialog";
import { Coupon } from "@/types/custom.types";

export function PromotionsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCouponId, setSelectedCouponId] = useState<number | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  const { data, isLoading, error } = useAdminCoupons({
    pagination: { page: 1, limit: 50 },
  });

  const deleteCouponMutation = useDeleteCoupon({
    onSuccess: () => {
      setDeleteDialogOpen(false);
      setSelectedCouponId(null);
    },
  });

  const handleEditCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setEditDialogOpen(true);
  };

  const handleDeleteCoupon = (couponId: number) => {
    setSelectedCouponId(couponId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedCouponId) {
      deleteCouponMutation.mutate({ couponId: selectedCouponId });
    }
  };

  const handleCopyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  // Filter coupons based on search and status
  const filteredCoupons = data?.coupons.filter((coupon) => {
    const matchesSearch =
      coupon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === "all") return matchesSearch;

    const status = getCouponStatusText(coupon);
    const statusMap = {
      active: status.text === "Đang hoạt động",
      inactive: status.text === "Tạm dừng",
      expired: status.text === "Đã hết hạn",
    };

    return matchesSearch && statusMap[statusFilter as keyof typeof statusMap];
  });

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <p className="text-destructive">
            Không thể tải danh sách khuyến mãi: {error.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh Sách Khuyến Mãi</CardTitle>
            <AdminCreateCouponDialog>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tạo Mã Giảm Giá
              </Button>
            </AdminCreateCouponDialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Tìm theo tên hoặc mã coupon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                {couponStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã Coupon</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Giá Trị</TableHead>
                  <TableHead>Sử Dụng</TableHead>
                  <TableHead>Hạn Sử Dụng</TableHead>
                  <TableHead>Trạng Thái</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCoupons?.map((coupon) => {
                  const status = getCouponStatusText(coupon);
                  return (
                    <TableRow key={coupon.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                            {coupon.code}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyCouponCode(coupon.code)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{coupon.name}</TableCell>
                      <TableCell>
                        {coupon.type === "percentage" ? "Phần trăm" : "Cố định"}
                      </TableCell>
                      <TableCell>
                        {formatCouponValue(coupon.type, coupon.value)}
                      </TableCell>
                      <TableCell>
                        {formatUsageLimit(
                          coupon.usage_limit,
                          coupon.used_count
                        )}
                      </TableCell>
                      <TableCell>
                        {coupon.expires_at
                          ? formatDate(coupon.expires_at)
                          : "Không giới hạn"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.text}</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <AdminCouponDetailDialog coupon={coupon}>
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Xem chi tiết
                              </DropdownMenuItem>
                            </AdminCouponDetailDialog>
                            <DropdownMenuItem
                              onClick={() => handleEditCoupon(coupon)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteCoupon(coupon.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredCoupons?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      Không tìm thấy khuyến mãi nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Coupon Dialog */}
      {selectedCoupon && (
        <AdminEditCouponDialog
          coupon={selectedCoupon}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa mã giảm giá</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa mã giảm giá này? Hành động này không thể
              hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteCouponMutation.isPending}
            >
              {deleteCouponMutation.isPending ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
