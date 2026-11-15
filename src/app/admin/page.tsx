import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AdminEntryPage() {
  const session = await auth();

  if (!session?.user || (session.user.role !== "ADVOCATE" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/login?role=admin&callbackUrl=%2Fadmin");
  }

  redirect("/admin/cases");
}
