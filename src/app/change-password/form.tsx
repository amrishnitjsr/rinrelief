"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { changeClientPassword } from "@/app/actions/case-actions";
import { Button, Card } from "@/components/ui";

export default function ChangePasswordForm() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setError("");
    try { await changeClientPassword({ currentPassword, newPassword }); router.replace("/dashboard"); router.refresh(); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Could not update password"); setSaving(false); }
  }
  return <main className="grid min-h-screen place-items-center bg-navy px-5 py-12"><Card className="w-full max-w-md p-8"><h1 className="serif text-3xl font-bold text-navy">Create your new password</h1><p className="mt-3 text-sm leading-6 text-slate-500">For security, change the temporary password before viewing your case dashboard.</p><form onSubmit={submit} className="mt-6 grid gap-4"><label className="grid gap-1.5 text-sm font-semibold text-slate-700">Temporary password<input required minLength={8} type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-3 font-normal" /></label><label className="grid gap-1.5 text-sm font-semibold text-slate-700">New password<input required minLength={8} type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-3 font-normal" /></label>{error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<Button type="submit" loading={saving} loadingText="Saving...">Save new password</Button></form></Card></main>;
}
