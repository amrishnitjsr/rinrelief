"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { Button, Card } from "@/components/ui";

export default function LoginPage() {
  return <Suspense fallback={<div className="grid min-h-screen place-items-center bg-navy text-white">Loading secure sign in...</div>}><LoginForm /></Suspense>;
}

function LoginForm() {
  const searchParams = useSearchParams();
  const requestedRole = searchParams.get("role") === "admin" ? "admin" : "client";
  const [mode, setMode] = useState<"client" | "admin">(requestedRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const requestedCallbackUrl = searchParams.get("callbackUrl");
  const callbackUrl =
    requestedCallbackUrl?.startsWith("/") && !requestedCallbackUrl.startsWith("//")
      ? requestedCallbackUrl
      : mode === "admin"
        ? "/admin/cases"
        : "/case-intake";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", { email, password, redirect: false, callbackUrl });
    if (!result || result.error) {
      setError("Those credentials could not be verified. Check your email and password.");
      setLoading(false);
      return;
    }
    window.location.assign(callbackUrl);
  }

  return (
    <main className="min-h-screen bg-navy px-5 py-12">
      <div className="mx-auto max-w-md">
        <Link href="/" className="mx-auto flex w-fit items-center gap-2 text-white">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold text-navy"><ShieldCheck size={22} /></span>
          <span className="serif text-2xl font-bold">Rinrelife</span>
        </Link>
        <Card className="mt-10 p-7 sm:p-9">
          <div className="text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-navy"><LockKeyhole size={21} /></div>
            <h1 className="serif mt-4 text-3xl font-bold text-navy">{mode === "admin" ? "Advocate workspace" : "Welcome back"}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">{mode === "admin" ? "Secure access for advocates and administrators." : "Access your case updates and legal consultation."}</p>
          </div>
          <div className="mt-7 grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-sm font-semibold">
            <button type="button" onClick={() => setMode("client")} className={`rounded-lg py-2.5 ${mode === "client" ? "bg-white text-navy shadow-sm" : "text-slate-500"}`}>Client login</button>
            <button type="button" onClick={() => setMode("admin")} className={`rounded-lg py-2.5 ${mode === "admin" ? "bg-white text-navy shadow-sm" : "text-slate-500"}`}>Admin login</button>
          </div>
          <form onSubmit={submit} className="mt-7 space-y-4">
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">Email address<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="rounded-xl border border-slate-200 px-3.5 py-3 font-normal outline-none focus:border-gold focus:ring-2 focus:ring-gold/20" placeholder={mode === "admin" ? "advocate@yourfirm.com" : "you@example.com"} /></label>
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">Password
              <span className="relative">
                <input required minLength={8} type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-slate-200 px-3.5 py-3 pr-11 font-normal outline-none focus:border-gold focus:ring-2 focus:ring-gold/20" placeholder="At least 8 characters" />
                <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute inset-y-0 right-0 grid w-11 place-items-center text-slate-500" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </span>
            </label>
            {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">{loading ? "Verifying..." : mode === "admin" ? "Open advocate workspace" : "Sign in"} <ArrowRight size={16} /></Button>
          </form>
          {mode === "client" && <Link href="/forgot-password" className="mt-5 block text-center text-sm font-bold text-navy underline">Forgot your password?</Link>}
          {mode === "client" && <p className="mt-6 text-center text-sm text-slate-500">New to Rinrelife? <Link href="/register" className="font-bold text-navy underline">Create a client account</Link></p>}
          {mode === "admin" && <p className="mt-6 text-center text-xs leading-5 text-slate-400">Admin accounts are created by the deployment owner. Do not share advocate credentials.</p>}
        </Card>
      </div>
    </main>
  );
}
