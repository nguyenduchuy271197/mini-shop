"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileForm from "./profile-form";
import AvatarSection from "./avatar-section";
import { User, Image as ImageIcon } from "lucide-react";

export default function ProfileTabs() {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="profile" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Thông tin cá nhân
        </TabsTrigger>
        <TabsTrigger value="avatar" className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          Ảnh đại diện
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="mt-6">
        <ProfileForm />
      </TabsContent>

      <TabsContent value="avatar" className="mt-6">
        <AvatarSection />
      </TabsContent>
    </Tabs>
  );
}
