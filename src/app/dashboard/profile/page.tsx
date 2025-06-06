import ProfileTabs from "./_components/profile-tabs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thông tin cá nhân | Mini Shop",
  description: "Quản lý thông tin cá nhân và cài đặt tài khoản",
};

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Thông tin cá nhân
          </h1>
          <p className="text-gray-600 mt-2">
            Quản lý thông tin cá nhân và cài đặt tài khoản của bạn
          </p>
        </div>

        <ProfileTabs />
      </div>
    </div>
  );
}
