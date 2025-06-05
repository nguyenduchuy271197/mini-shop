"use client";

import { useState } from "react";
import { Profile } from "@/types/custom.types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Shield, Key, Mail, Calendar, AlertTriangle } from "lucide-react";
import ChangePasswordForm from "./change-password-form";

interface ProfileSettingsProps {
  profile: Profile;
}

export default function ProfileSettings({ profile }: ProfileSettingsProps) {
  const [showChangePassword, setShowChangePassword] = useState(false);

  return (
    <div className="space-y-6">
      {/* Account Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Bảo mật tài khoản
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">Email đăng nhập</p>
                <p className="text-sm text-gray-600">{profile.email}</p>
              </div>
            </div>
            <Badge variant="outline">Đã xác thực</Badge>
          </div>

          <Separator />

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">Mật khẩu</p>
                <p className="text-sm text-gray-600">
                  Cập nhật lần cuối:{" "}
                  {new Date(profile.updated_at).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowChangePassword(!showChangePassword)}
            >
              Đổi mật khẩu
            </Button>
          </div>

          {showChangePassword && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <ChangePasswordForm
                onSuccess={() => setShowChangePassword(false)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Thông tin tài khoản
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700">
                Ngày tạo tài khoản
              </p>
              <p className="text-sm text-gray-600">
                {new Date(profile.created_at).toLocaleDateString("vi-VN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                Cập nhật gần nhất
              </p>
              <p className="text-sm text-gray-600">
                {new Date(profile.updated_at).toLocaleDateString("vi-VN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Vùng nguy hiểm
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <h4 className="font-medium text-red-800 mb-2">Xóa tài khoản</h4>
            <p className="text-sm text-red-700 mb-4">
              Hành động này sẽ xóa vĩnh viễn tài khoản và tất cả dữ liệu liên
              quan. Bạn sẽ không thể khôi phục sau khi xóa.
            </p>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                // TODO: Implement delete account functionality
                alert("Tính năng này đang được phát triển");
              }}
            >
              Xóa tài khoản
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
