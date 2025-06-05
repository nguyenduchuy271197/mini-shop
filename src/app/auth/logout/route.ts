import { logoutAndRedirect } from "@/actions";

export async function POST() {
  await logoutAndRedirect();
} 