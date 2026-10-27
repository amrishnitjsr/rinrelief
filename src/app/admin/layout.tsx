import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AdminShell from "./admin-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADVOCATE" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/login?role=admin");
  }
  return <AdminShell>{children}</AdminShell>;
}
