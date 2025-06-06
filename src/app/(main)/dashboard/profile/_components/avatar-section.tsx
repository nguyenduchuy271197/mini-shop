"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload, Trash2, User } from "lucide-react";
import { useProfile, useUploadAvatar, useDeleteAvatar } from "@/hooks/users";

export default function AvatarSection() {
  const { data: profileData, isLoading: isLoadingProfile } = useProfile();
  const uploadAvatar = useUploadAvatar();
  const deleteAvatar = useDeleteAvatar();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const profile = profileData?.success ? profileData.profile : null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    uploadAvatar.mutate(selectedFile, {
      onSuccess: () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      },
    });
  };

  const handleDelete = () => {
    deleteAvatar.mutate();
  };

  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  if (isLoadingProfile) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Đang tải thông tin...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ảnh đại diện</CardTitle>
        <CardDescription>
          Cập nhật ảnh đại diện của bạn. Chỉ chấp nhận file ảnh dưới 5MB.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Avatar Display */}
        <div className="flex items-center justify-center">
          <Avatar className="h-32 w-32">
            <AvatarImage
              src={profile?.avatar_url || undefined}
              alt={profile?.full_name || "Avatar"}
            />
            <AvatarFallback className="text-2xl">
              {profile?.full_name ? (
                profile.full_name.charAt(0).toUpperCase()
              ) : (
                <User className="h-12 w-12" />
              )}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* File Input (Hidden) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Selected File Preview */}
        {selectedFile && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                File đã chọn: {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                Kích thước: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>

            <div className="flex gap-2 justify-center">
              <Button
                onClick={handleUpload}
                disabled={uploadAvatar.isPending}
                className="flex-1 max-w-xs"
              >
                {uploadAvatar.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tải lên...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Tải lên
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                disabled={uploadAvatar.isPending}
              >
                Hủy
              </Button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!selectedFile && (
          <div className="flex gap-2 justify-center">
            <Button
              onClick={handleSelectFile}
              disabled={uploadAvatar.isPending || deleteAvatar.isPending}
              className="flex-1 max-w-xs"
            >
              <Upload className="mr-2 h-4 w-4" />
              Chọn ảnh mới
            </Button>

            {profile?.avatar_url && (
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={uploadAvatar.isPending || deleteAvatar.isPending}
                className="flex-1 max-w-xs"
              >
                {deleteAvatar.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa ảnh
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {/* Guidelines */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WebP)</p>
          <p>• Kích thước tối đa: 5MB</p>
          <p>• Khuyến nghị: ảnh vuông với tỷ lệ 1:1</p>
        </div>
      </CardContent>
    </Card>
  );
}
