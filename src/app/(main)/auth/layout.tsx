import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import React from "react";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  return <div>{children}</div>;
}
