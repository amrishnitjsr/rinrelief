"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Menu,
  Settings,
  ShieldAlert,
  Users,
} from "lucide-react";

export default function AdminShell({ children, isSuperAdmin, priorityCaseCount }: { children: React.ReactNode; isSuperAdmin: boolean; priorityCaseCount: number }) {
  const [collapsed, setCollapsed] = useState(false);
  const [greeting, setGreeting] = useState("Hello");
  const pathname = usePathname();

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : hour < 21 ? "Good evening" : "Good night");
  }, []);

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className={`fixed inset-y-0 left-0 z-30 hidden border-r border-slate-200 bg-navy text-white transition-all lg:block ${collapsed ? "w-20" : "w-64"}`}>
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <Link href="/" className="flex items-center gap-2">
            {!collapsed && <span className="serif text-xl font-bold">Rinrelife</span>}
            <ShieldAlert className="text-gold" />
          </Link>
          <button onClick={() => setCollapsed(!collapsed)} className="rounded-lg p-1 text-slate-400 hover:bg-white/10" aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}>
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
        <nav className="space-y-1 p-3">
          {([[LayoutDashboard, "Case queue", "/admin/cases"], [MessageCircle, "Lead queue", "/admin/leads"], [ShieldAlert, "Priority harassment", "/admin/cases?priority=high"], [Users, "Lender aggregator", "/admin/cases"], [CreditCard, "Payment ledger", "/admin/payments"], ...(isSuperAdmin ? [[Settings, "Settings", "/admin/settings"]] : [])] as [React.ElementType, string, string][]).map(([Icon, label, href]) => {
            const active = label === "Case queue" ? pathname === "/admin/cases" : href !== "/admin/cases" && pathname.startsWith(href);
            return <Link href={href} key={label} aria-current={active ? "page" : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${active ? "bg-white/15 text-white ring-1 ring-white/20" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}>
              <Icon size={18} />{!collapsed && label}
            </Link>;
          })}
        </nav>
        <button onClick={() => signOut({ callbackUrl: "/login?role=admin" })} className={`absolute bottom-5 flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-slate-300 hover:bg-white/10 ${collapsed ? "left-3 right-3" : "left-4 right-4"}`}>
          <LogOut size={18} />{!collapsed && "Sign out"}
        </button>
      </aside>
      <div className={`transition-all ${collapsed ? "lg:pl-20" : "lg:pl-64"}`}>
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3"><Menu className="text-slate-500 lg:hidden" /><div><p className="text-xs font-bold uppercase tracking-widest text-red-600">Live operations</p><p className="font-semibold text-navy">{greeting}, Adv. Tisha</p></div></div>
          <div className="flex items-center gap-4"><div className={`hidden items-center gap-2 rounded-full px-3 py-2 text-xs font-bold sm:flex ${priorityCaseCount ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}><span className={`h-2 w-2 rounded-full ${priorityCaseCount ? "animate-pulse bg-red-600" : "bg-emerald-600"}`} /> {priorityCaseCount ? `${priorityCaseCount} priority alert${priorityCaseCount === 1 ? "" : "s"}` : "No priority alerts"}</div><Bell className="text-slate-500" /></div>
        </header>
        <div className={`border-b px-5 py-3 text-sm lg:px-8 ${priorityCaseCount ? "border-amber-200 bg-amber-50 text-amber-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}><b>{priorityCaseCount ? "Priority queue:" : "Priority queue clear:"}</b> {priorityCaseCount ? `${priorityCaseCount} case${priorityCaseCount === 1 ? "" : "s"} need review for harassment or legal notice.` : "No active cases require priority review."}</div>
        <main className="p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
