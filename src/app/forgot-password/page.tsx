"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { BrandLogo } from "@/components/brand-logo";

export default function ForgotPasswordPage() {
  return <Suspense fallback={<div className="grid min-h-screen place-items-center bg-navy text-white">Loading secure recovery...</div>}><ForgotPasswordForm /></Suspense>;
}

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const isAdmin = searchParams.get("role") === "admin";
  const loginHref = isAdmin ? "/login?role=admin" : "/login?role=client";
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [step, setStep] = useState<"request" | "reset">("request");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step === "reset") {
      if (password !== confirmation) {
        setError("Passwords do not match.");
        return;
      }
      setLoading(true);
      setError("");
      setMessage("");
      try {
        const response = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code, password }),
        });
        const result = (await response.json()) as { error?: string };
        if (!response.ok) throw new Error(result.error ?? "Unable to update your password.");
        setMessage("Your password has been updated. You can sign in now.");
        setPassword("");
        setConfirmation("");
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Unable to update your password.");
      } finally {
        setLoading(false);
      }
      return;
    }
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
      if (!response.ok) throw new Error(result.error ?? "Unable to send the verification code.");
      setMessage(result.message ?? "Check your email for a verification code.");
      setStep("reset");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to send the verification code.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-navy px-5 py-12">
      <div className="mx-auto max-w-md">
        <Link href="/" className="mx-auto flex w-fit items-center gap-2 text-white">
          <BrandLogo variant="light" className="h-14 w-44" priority />
        </Link>
        <Card className="mt-10 p-7 sm:p-9">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-navy"><Mail size={21} /></div>
          <h1 className="serif mt-4 text-center text-3xl font-bold text-navy">Reset your password</h1>
          <p className="mt-2 text-center text-sm leading-6 text-slate-500">Admins can reset their password using a secure email OTP. If you have not registered yet, register first.</p>
          <form onSubmit={submit} className="mt-7 space-y-4">
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">Email address
              <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="rounded-xl border border-slate-200 px-3.5 py-3 font-normal outline-none focus:border-gold focus:ring-2 focus:ring-gold/20" placeholder="you@example.com" />
            </label>
            {step === "reset" && <>
              <label className="grid gap-1.5 text-sm font-semibold text-slate-700">6-digit verification code
                <input required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => setCode(event.target.value)} className="rounded-xl border border-slate-200 px-3.5 py-3 font-normal tracking-[.3em] outline-none focus:border-gold focus:ring-2 focus:ring-gold/20" placeholder="000000" />
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-slate-700">New password
                <input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="rounded-xl border border-slate-200 px-3.5 py-3 font-normal outline-none focus:border-gold focus:ring-2 focus:ring-gold/20" placeholder="At least 8 characters" />
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-slate-700">Confirm new password
                <input required minLength={8} type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="rounded-xl border border-slate-200 px-3.5 py-3 font-normal outline-none focus:border-gold focus:ring-2 focus:ring-gold/20" placeholder="Repeat your password" />
              </label>
            </>}
            {message && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700" role="status">{message}</p>}
            {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
            <Button type="submit" loading={loading} loadingText={step === "request" ? "Sending code..." : "Updating password..."} className="w-full">{step === "request" ? "Email me a verification code" : "Set new password"} <ArrowRight size={16} /></Button>
          </form>
          {step === "request" && <Link href="/register" className="mt-4 flex items-center justify-center text-sm font-bold text-gold">Register first</Link>}
          <Link href={loginHref} className="mt-6 flex items-center justify-center gap-2 text-sm font-bold text-navy"><ArrowLeft size={15} /> Back to {isAdmin ? "admin" : "client"} sign in</Link>
        </Card>
      </div>
    </main>
  );
}
