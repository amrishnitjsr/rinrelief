import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SettingsPanel from "./settings-panel";

export default async function SettingsPage() {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    redirect("/admin/cases");
  }
  const [admins, activity] = await Promise.all([
    prisma.user.findMany({
      where: { role: { in: ["SUPER_ADMIN", "ADVOCATE"] } },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.auditLog.findMany({
      where: { actor: { role: { in: ["SUPER_ADMIN", "ADVOCATE"] } } },
      select: { id: true, action: true, entityType: true, entityId: true, metadata: true, createdAt: true, actor: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
  ]);

  return <><div><p className="text-sm font-bold uppercase tracking-widest text-[#9b7b18]">Security</p><h1 className="serif mt-1 text-4xl font-bold text-navy">Admin settings</h1><p className="mt-2 text-sm text-slate-500">Manage administrators who can access the full operations console.</p></div><SettingsPanel admins={admins.map((admin) => ({ ...admin, role: admin.role === "SUPER_ADMIN" ? "SUPER_ADMIN" as const : "ADVOCATE" as const, createdAt: admin.createdAt.toISOString() }))} activity={activity.map((entry) => ({ ...entry, createdAt: entry.createdAt.toISOString() }))} /></>;
}
