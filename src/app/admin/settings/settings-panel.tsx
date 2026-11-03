"use client";

import { useState } from "react";
import { Activity, UserPlus } from "lucide-react";
import { Card } from "@/components/ui";
import AdminCreationForm from "./admin-creation-form";

type Admin = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "SUPER_ADMIN" | "ADVOCATE";
  createdAt: string;
};

type ActivityEntry = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  actor: { name: string; email: string } | null;
};

export default function SettingsPanel({ admins, activity }: { admins: Admin[]; activity: ActivityEntry[] }) {
  const [section, setSection] = useState<"create" | "activity" | null>(null);

  return (
    <>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <button type="button" onClick={() => setSection(section === "create" ? null : "create")} className={`rounded-2xl border p-5 text-left shadow-soft transition-transform duration-100 active:scale-[.99] ${section === "create" ? "border-gold bg-[#fffdf4]" : "border-slate-200 bg-white hover:border-gold"}`}>
          <UserPlus className="text-gold" size={22} />
          <h2 className="mt-3 text-lg font-bold text-navy">Create admin</h2>
          <p className="mt-1 text-sm text-slate-500">Add an admin who can operate the portal without super-admin control.</p>
        </button>
        <button type="button" onClick={() => setSection(section === "activity" ? null : "activity")} className={`rounded-2xl border p-5 text-left shadow-soft transition-transform duration-100 active:scale-[.99] ${section === "activity" ? "border-gold bg-[#fffdf4]" : "border-slate-200 bg-white hover:border-gold"}`}>
          <Activity className="text-gold" size={22} />
          <h2 className="mt-3 text-lg font-bold text-navy">Admin access & activity</h2>
          <p className="mt-1 text-sm text-slate-500">Review admins and everything they have done.</p>
        </button>
      </div>

      {section === "create" && <Card className="mt-6 max-w-2xl p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-navy">Create an admin</h2>
          <p className="mt-1 text-sm text-slate-500">Only the single super admin can create admins. Admins cannot create accounts or change access.</p>
        </div>
        <AdminCreationForm />
      </Card>}

      {section === "activity" && <div className="mt-6 space-y-6">
        <Card className="overflow-hidden">
          <div className="border-b border-slate-200 p-6">
            <h2 className="text-xl font-bold text-navy">Admin accounts</h2>
            <p className="mt-1 text-sm text-slate-500">The single super admin and all admins are listed for accountability.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr><th className="px-6 py-3">Admin</th><th className="px-6 py-3">Phone</th><th className="px-6 py-3">Created</th><th className="px-6 py-3">Access</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {admins.map((admin) => <tr key={admin.id}>
                  <td className="px-6 py-4"><p className="font-semibold text-navy">{admin.name}</p><p className="text-xs text-slate-500">{admin.email}</p></td>
                  <td className="px-6 py-4 text-slate-600">{admin.phone}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{new Date(admin.createdAt).toLocaleString("en-IN")}</td>
                  <td className="px-6 py-4"><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${admin.role === "SUPER_ADMIN" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{admin.role === "SUPER_ADMIN" ? "Super admin" : "Admin"}</span></td>
                </tr>)}
              </tbody>
            </table>
          </div>
        </Card>
        <Card className="overflow-hidden">
          <div className="border-b border-slate-200 p-6">
            <h2 className="text-xl font-bold text-navy">Admin activity history</h2>
            <p className="mt-1 text-sm text-slate-500">Case, lead, payment, credential, document, and account actions by every super admin.</p>
          </div>
          {activity.length === 0 ? <p className="p-8 text-sm text-slate-500">No admin activity recorded yet.</p> : <div className="divide-y divide-slate-100">
            {activity.map((entry) => <div key={entry.id} className="grid gap-1 px-6 py-4 sm:grid-cols-[180px_1fr_auto] sm:items-center sm:gap-4">
              <div><p className="font-semibold text-navy">{entry.actor?.name ?? "Unknown admin"}</p><p className="text-xs text-slate-500">{entry.actor?.email}</p></div>
              <div><p className="font-semibold text-slate-700">{formatAction(entry.action)}</p><p className="text-xs text-slate-500">{entry.entityType} · {entry.entityId}</p></div>
              <time className="text-xs text-slate-400">{new Date(entry.createdAt).toLocaleString("en-IN")}</time>
            </div>)}
          </div>}
        </Card>
      </div>}
    </>
  );
}

function formatAction(action: string) {
  return action.replaceAll("_", " ").toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase());
}
