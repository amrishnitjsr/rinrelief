"use client";

import { useState } from "react";
import { Activity, KeyRound, UserPlus } from "lucide-react";
import { Button, Card, Field } from "@/components/ui";
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
  const [section, setSection] = useState<"create" | "activity" | "password" | null>(null);

  return (
    <>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <button type="button" onClick={() => setSection(section === "create" ? null : "create")} className={`rounded-2xl border p-5 text-left shadow-soft transition-transform duration-100 active:scale-[.99] ${section === "create" ? "border-gold bg-[#fffdf4]" : "border-slate-200 bg-white hover:border-gold"}`}>
          <UserPlus className="text-gold" size={22} />
          <h2 className="mt-3 text-lg font-bold text-navy">Create admin</h2>
          <p className="mt-1 text-sm text-slate-500">Add an admin who can operate the portal without super-admin control.</p>
        </button>
        <button type="button" onClick={() => setSection(section === "password" ? null : "password")} className={`rounded-2xl border p-5 text-left shadow-soft transition-transform duration-100 active:scale-[.99] ${section === "password" ? "border-gold bg-[#fffdf4]" : "border-slate-200 bg-white hover:border-gold"}`}>
          <KeyRound className="text-gold" size={22} />
          <h2 className="mt-3 text-lg font-bold text-navy">Change password</h2>
          <p className="mt-1 text-sm text-slate-500">Confirm a password change through your email.</p>
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

      {section === "password" && <Card className="mt-6 max-w-2xl p-6"><PasswordChangeForm /></Card>}

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

function PasswordChangeForm() {
  const [step, setStep] = useState<"request" | "verify">("request");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function requestCode() {
    setLoading(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/admin/password/request", { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Unable to send the code.");
      setStep("verify"); setMessage("A verification code was sent to your admin email.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to send the code.");
    } finally { setLoading(false); }
  }

  async function verify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/admin/password/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, newPassword: password }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Unable to update your password.");
      setMessage("Password updated successfully."); setCode(""); setPassword(""); setStep("request");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update your password.");
    } finally { setLoading(false); }
  }

  return <div><h2 className="text-xl font-bold text-navy">Change super admin password</h2><p className="mt-1 text-sm text-slate-500">We will send a one-time code to your current admin email before changing the password.</p>{step === "request" ? <Button type="button" className="mt-5" onClick={requestCode} loading={loading} loadingText="Sending code...">Email me a verification code</Button> : <form onSubmit={verify} className="mt-5 grid gap-4"><Field label="6-digit email code" value={code} onChange={(event) => setCode(event.target.value)} inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required /><Field label="New password" type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" required /><Button type="submit" loading={loading} loadingText="Updating...">Update password</Button></form>}{message && <p role="status" className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{message}</p>}{error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}</div>;
}

function formatAction(action: string) {
  return action.replaceAll("_", " ").toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase());
}
