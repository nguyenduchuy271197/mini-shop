"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { useShippingZones } from "@/hooks/admin/shipping";
import { getShippingZoneStatusText, formatShippingCost } from "../_lib/utils";
import { formatDate } from "@/lib/utils";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Settings,
} from "lucide-react";

interface ShippingZonesListProps {
  onCreateZone: () => void;
  onEditZone: (zoneId: number) => void;
  onViewZone: (zoneId: number) => void;
  onManageRates: (zoneId: number) => void;
}

export function ShippingZonesList({
  onCreateZone,
  onEditZone,
  onViewZone,
  onManageRates,
}: ShippingZonesListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);

  const { data, isLoading, error } = useShippingZones({
    pagination: { page: 1, limit: 50 },
    includeInactive: true,
  });

  const handleDeleteZone = (zoneId: number) => {
    setSelectedZoneId(zoneId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedZoneId) {
      // In a real app, this would call a delete mutation
      console.log("Delete zone:", selectedZoneId);
      setDeleteDialogOpen(false);
      setSelectedZoneId(null);
    }
  };

  // Filter zones based on search
  const filteredZones = data?.zones.filter(
    (zone) =>
      zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zone.countries.some((country) =>
        country.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <p className="text-destructive">
            Không thể tải danh sách khu vực giao hàng: {error.message}
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
            <CardTitle>Khu Vực Giao Hàng</CardTitle>
            <Button onClick={onCreateZone}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo Khu Vực Mới
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Tìm theo tên khu vực hoặc quốc gia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
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
                  <TableHead>Tên Khu Vực</TableHead>
                  <TableHead>Quốc Gia/Vùng</TableHead>
                  <TableHead>Số Phương Thức</TableHead>
                  <TableHead>Phí Từ</TableHead>
                  <TableHead>Trạng Thái</TableHead>
                  <TableHead>Cập Nhật</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredZones?.map((zone) => {
                  const status = getShippingZoneStatusText(zone);
                  const minCost = Math.min(
                    ...zone.shipping_rates.map((rate) => rate.cost)
                  );
                  const activeRates = zone.shipping_rates.filter(
                    (rate) => rate.is_active
                  );

                  return (
                    <TableRow key={zone.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{zone.name}</div>
                          {zone.description && (
                            <div className="text-sm text-gray-500">
                              {zone.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex flex-wrap gap-1">
                            {zone.countries.slice(0, 2).map((country) => (
                              <Badge
                                key={country}
                                variant="outline"
                                className="text-xs"
                              >
                                {country}
                              </Badge>
                            ))}
                            {zone.countries.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{zone.countries.length - 2} khác
                              </Badge>
                            )}
                          </div>
                          {zone.states && zone.states.length > 0 && (
                            <div className="text-xs text-gray-500">
                              {zone.states.length} tỉnh/thành
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <span className="font-medium">
                            {activeRates.length}
                          </span>
                          <span className="text-gray-500">
                            /{zone.shipping_rates.length}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {zone.shipping_rates.length > 0 ? (
                          formatShippingCost(minCost)
                        ) : (
                          <span className="text-gray-500">Chưa có</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.text}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(zone.updated_at)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => onViewZone(zone.id)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onManageRates(zone.id)}
                            >
                              <Settings className="h-4 w-4 mr-2" />
                              Quản lý phí vận chuyển
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onEditZone(zone.id)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Chỉnh sửa khu vực
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteZone(zone.id)}
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
                {filteredZones?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      Không tìm thấy khu vực giao hàng nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa khu vực giao hàng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa khu vực giao hàng này? Hành động này sẽ
              xóa tất cả phương thức vận chuyển liên quan và không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
