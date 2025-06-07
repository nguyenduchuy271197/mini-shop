"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
  Eye,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  useAdminBanners,
  useDeleteBanner,
  useReorderBanners,
} from "@/hooks/admin/banners";
import type { Banner, BannerFilters } from "@/hooks/admin/banners";
import Image from "next/image";
import {
  bannerStatusOptions,
  bannerPositionOptions,
  getBannerEffectiveStatus,
  getBannerPositionText,
  getBannerTargetText,
  formatBannerPeriod,
  truncateDescription,
  getDeleteBannerConfirmation,
  sortBannersByPriority,
} from "../_lib/utils";

interface BannersListProps {
  onCreateBanner: () => void;
  onEditBanner: (banner: Banner) => void;
}

export default function BannersList({
  onCreateBanner,
  onEditBanner,
}: BannersListProps) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<BannerFilters>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);

  // Queries
  const { data: bannersData, isLoading } = useAdminBanners({
    filters: {
      ...filters,
      position: filters.position || undefined,
      isActive: filters.isActive,
    },
  });

  // Mutations
  const { mutate: deleteBanner, isPending: isDeleting } = useDeleteBanner({
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã xóa banner",
      });
      setShowDeleteDialog(false);
      setBannerToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description:
          typeof error === "string" ? error : (error as Error).message,
        variant: "destructive",
      });
    },
  });

  const { mutate: reorderBanners, isPending: isReordering } = useReorderBanners(
    {
      onSuccess: () => {
        toast({
          title: "Thành công",
          description: "Đã cập nhật thứ tự banner",
        });
      },
      onError: (error) => {
        toast({
          title: "Lỗi",
          description:
            typeof error === "string" ? error : (error as Error).message,
          variant: "destructive",
        });
      },
    }
  );

  const banners = bannersData?.banners || [];

  // Filter and search banners
  const filteredBanners = banners.filter((banner) => {
    const matchesSearch =
      !search ||
      banner.title.toLowerCase().includes(search.toLowerCase()) ||
      (banner.description &&
        banner.description.toLowerCase().includes(search.toLowerCase()));

    return matchesSearch;
  });

  const sortedBanners = sortBannersByPriority(filteredBanners);

  const handleDeleteBanner = (banner: Banner) => {
    setBannerToDelete(banner);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (bannerToDelete) {
      deleteBanner({ bannerId: bannerToDelete.id });
    }
  };

  const handleMoveUp = (banner: Banner) => {
    const currentIndex = sortedBanners.findIndex((b) => b.id === banner.id);
    if (currentIndex === 0) return;

    const aboveBanner = sortedBanners[currentIndex - 1];
    const newOrder = [
      { id: banner.id, priority: aboveBanner.priority + 1 },
      { id: aboveBanner.id, priority: banner.priority },
    ];

    reorderBanners({ bannerOrders: newOrder });
  };

  const handleMoveDown = (banner: Banner) => {
    const currentIndex = sortedBanners.findIndex((b) => b.id === banner.id);
    if (currentIndex === sortedBanners.length - 1) return;

    const belowBanner = sortedBanners[currentIndex + 1];
    const newOrder = [
      { id: banner.id, priority: belowBanner.priority },
      { id: belowBanner.id, priority: banner.priority + 1 },
    ];

    reorderBanners({ bannerOrders: newOrder });
  };

  const isPending = isDeleting || isReordering;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Đang tải...</div>
        </CardContent>
      </Card>
    );
  }

  const deleteConfirmation = bannerToDelete
    ? getDeleteBannerConfirmation(bannerToDelete.title)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Danh sách banner</h2>
          <p className="text-muted-foreground">
            Quản lý banner quảng cáo trên trang chủ
          </p>
        </div>
        <Button onClick={onCreateBanner}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm banner
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm theo tiêu đề, mô tả..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <Select
                value={
                  filters.isActive === undefined
                    ? "all"
                    : filters.isActive
                    ? "active"
                    : "inactive"
                }
                onValueChange={(value) => {
                  if (value === "all") {
                    setFilters((prev) => ({ ...prev, isActive: undefined }));
                  } else {
                    setFilters((prev) => ({
                      ...prev,
                      isActive: value === "active",
                    }));
                  }
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {bannerStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.position || "all"}
                onValueChange={(value) => {
                  if (value === "all") {
                    setFilters((prev) => ({ ...prev, position: undefined }));
                  } else {
                    setFilters((prev) => ({
                      ...prev,
                      position: value as
                        | "hero"
                        | "sidebar"
                        | "footer"
                        | "popup"
                        | "category",
                    }));
                  }
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Vị trí" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả vị trí</SelectItem>
                  {bannerPositionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Banners Table */}
      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Banner</TableHead>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Vị trí</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thời hạn</TableHead>
                  <TableHead>Độ ưu tiên</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedBanners.map((banner, index) => {
                  const effectiveStatus = getBannerEffectiveStatus(banner);

                  return (
                    <TableRow key={banner.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {banner.image_url ? (
                            <Image
                              src={banner.image_url}
                              alt={banner.title}
                              width={64}
                              height={40}
                              className="w-16 h-10 object-cover rounded border"
                            />
                          ) : (
                            <div className="w-16 h-10 bg-muted rounded border flex items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{banner.title}</div>
                          {banner.description && (
                            <div className="text-sm text-muted-foreground">
                              {truncateDescription(banner.description)}
                            </div>
                          )}
                          {banner.link_url && (
                            <div className="text-xs text-blue-600 mt-1">
                              → {getBannerTargetText(banner.target_type)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getBannerPositionText(banner.position)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={effectiveStatus.variant}>
                          {effectiveStatus.text}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatBannerPeriod(
                            banner.start_date,
                            banner.end_date
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {banner.priority}
                          </span>
                          <div className="flex flex-col gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => handleMoveUp(banner)}
                              disabled={index === 0 || isPending}
                            >
                              <ArrowUp className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => handleMoveDown(banner)}
                              disabled={
                                index === sortedBanners.length - 1 || isPending
                              }
                            >
                              <ArrowDown className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {banner.link_url && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                window.open(
                                  banner.link_url || "",
                                  banner.target_type
                                )
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEditBanner(banner)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteBanner(banner)}
                            disabled={isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {sortedBanners.length === 0 && (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Chưa có banner nào</h3>
              <p className="text-muted-foreground mb-4">
                Bắt đầu bằng cách tạo banner đầu tiên
              </p>
              <Button onClick={onCreateBanner}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm banner
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{deleteConfirmation?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirmation?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
