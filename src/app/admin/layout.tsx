import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminShell from "./admin-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADVOCATE" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/login?role=admin");
  }
  const priorityCaseCount = await prisma.debtCase.count({
    where: {
      status: { not: "CLOSED" },
      OR: [{ facingHarassment: true }, { receivedLegalNotice: true }],
    },
  });
  return <AdminShell isSuperAdmin={session.user.role === "SUPER_ADMIN"} priorityCaseCount={priorityCaseCount}>{children}</AdminShell>;
}
