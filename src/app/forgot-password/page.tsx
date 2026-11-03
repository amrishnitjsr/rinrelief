"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, ArrowRight, Mail, ShieldCheck } from "lucide-react";
import { Button, Card } from "@/components/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) throw new Error(result.error ?? "Unable to send the reset link.");
      setMessage(result.message ?? "Check your email for a reset link.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to send the reset link.");
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
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-navy"><Mail size={21} /></div>
          <h1 className="serif mt-4 text-center text-3xl font-bold text-navy">Reset your password</h1>
          <p className="mt-2 text-center text-sm leading-6 text-slate-500">Enter your email and we’ll send you a secure reset link.</p>
          <form onSubmit={submit} className="mt-7 space-y-4">
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">Email address
              <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="rounded-xl border border-slate-200 px-3.5 py-3 font-normal outline-none focus:border-gold focus:ring-2 focus:ring-gold/20" placeholder="you@example.com" />
            </label>
            {message && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700" role="status">{message}</p>}
            {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
            <Button type="submit" loading={loading} loadingText="Sending link..." className="w-full">Email me a reset link <ArrowRight size={16} /></Button>
          </form>
          <Link href="/login" className="mt-6 flex items-center justify-center gap-2 text-sm font-bold text-navy"><ArrowLeft size={15} /> Back to sign in</Link>
        </Card>
      </div>
    </main>
  );
}
