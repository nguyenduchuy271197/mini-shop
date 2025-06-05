"use client";

import { useState } from "react";
import { Profile } from "@/types/custom.types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileInfoForm from "./profile-info-form";
import ProfileSettings from "./profile-settings";
import { User, Settings, LogOut } from "lucide-react";

interface ProfileTabsProps {
  initialProfile: Profile;
}

export default function ProfileTabs({ initialProfile }: ProfileTabsProps) {
  const [profile, setProfile] = useState(initialProfile);

  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
  };

  return (
    <Tabs defaultValue="info" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="info" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Thông tin cá nhân
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Cài đặt tài khoản
        </TabsTrigger>
        <TabsTrigger value="logout" className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </TabsTrigger>
      </TabsList>

      <TabsContent value="info" className="mt-6">
        <ProfileInfoForm
          profile={profile}
          onProfileUpdate={handleProfileUpdate}
        />
      </TabsContent>

      <TabsContent value="settings" className="mt-6">
        <ProfileSettings profile={profile} />
      </TabsContent>

      <TabsContent value="logout" className="mt-6">
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            Bạn sẽ được đăng xuất khỏi tài khoản
          </p>
          <form action="/auth/logout" method="post">
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md"
            >
              Xác nhận đăng xuất
            </button>
          </form>
        </div>
      </TabsContent>
    </Tabs>
  );
}
