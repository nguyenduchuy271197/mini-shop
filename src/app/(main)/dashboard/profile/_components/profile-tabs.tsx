"use client";

import ProfileForm from "./profile-form";
import AvatarSection from "./avatar-section";

export default function ProfileTabs() {
  return (
    <div className="w-full space-y-4">
      {/* Avatar Section */}
      <AvatarSection />

      {/* Profile Form */}
      <ProfileForm />
    </div>
  );
}
