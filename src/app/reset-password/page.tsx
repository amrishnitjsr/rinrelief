"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { Button, Card } from "@/components/ui";

export default function ResetPasswordPage() {
  return <Suspense fallback={<div className="grid min-h-screen place-items-center bg-navy text-white">Loading secure reset...</div>}><ResetForm /></Suspense>;
}

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Unable to reset your password.");
      setMessage("Your password has been updated. You can sign in now.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to reset your password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-navy px-5 py-12">
      <div className="mx-auto max-w-md">
        <Link href="/" className="mx-auto flex w-fit items-center gap-2 text-white">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold text-navy"><ShieldCheck size={22} /></span>
          <span className="serif text-2xl font-bold">Rinrelife</span>
        </Link>
        <Card className="mt-10 p-7 sm:p-9">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-navy"><LockKeyhole size={21} /></div>
          <h1 className="serif mt-4 text-center text-3xl font-bold text-navy">Choose a new password</h1>
          <form onSubmit={submit} className="mt-7 space-y-4">
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">New password
              <input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="rounded-xl border border-slate-200 px-3.5 py-3 font-normal outline-none focus:border-gold focus:ring-2 focus:ring-gold/20" placeholder="At least 8 characters" />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">Confirm password
              <input required minLength={8} type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="rounded-xl border border-slate-200 px-3.5 py-3 font-normal outline-none focus:border-gold focus:ring-2 focus:ring-gold/20" placeholder="Repeat your password" />
            </label>
            {message && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700" role="status">{message} <Link href="/login" className="font-bold underline">Sign in</Link></p>}
            {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
            <Button type="submit" disabled={loading || !token || Boolean(message)} className="w-full">{loading ? "Updating password..." : "Update password"} <ArrowRight size={16} /></Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
