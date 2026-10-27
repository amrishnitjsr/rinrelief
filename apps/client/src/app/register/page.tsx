"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button, Card } from "@/components/ui";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.error ?? "Unable to create your account.");
      setLoading(false);
      return;
    }
    router.push("/login?registered=true");
  }
  return <main className="min-h-screen bg-navy px-5 py-12"><div className="mx-auto max-w-md"><Link href="/" className="mx-auto flex w-fit items-center gap-2 text-white"><span className="grid h-10 w-10 place-items-center rounded-xl bg-gold text-navy"><ShieldCheck size={22}/></span><span className="serif text-2xl font-bold">Rinrelife</span></Link><Card className="mt-10 p-7 sm:p-9"><h1 className="serif text-3xl font-bold text-navy">Create your client account</h1><p className="mt-2 text-sm leading-6 text-slate-500">Use the same email and phone number you provide during case intake.</p><form onSubmit={submit} className="mt-7 space-y-4">{[["name","Full name","text"],["email","Email address","email"],["phone","Mobile number","tel"]].map(([key,label,type])=><label key={key} className="grid gap-1.5 text-sm font-semibold text-slate-700">{label}<input required type={type} value={form[key as keyof typeof form]} onChange={event=>setForm({...form,[key]:event.target.value})} className="rounded-xl border border-slate-200 px-3.5 py-3 font-normal outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"/></label>)}<label className="grid gap-1.5 text-sm font-semibold text-slate-700">Password<span className="relative"><input required minLength={8} type={showPassword ? "text" : "password"} value={form.password} onChange={event=>setForm({...form,password:event.target.value})} className="w-full rounded-xl border border-slate-200 px-3.5 py-3 pr-11 font-normal outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"/><button type="button" onClick={()=>setShowPassword((visible)=>!visible)} className="absolute inset-y-0 right-0 grid w-11 place-items-center text-slate-500" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></span></label>{error&&<p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<Button disabled={loading} className="w-full">{loading?"Creating account...":"Create account"}<ArrowRight size={16}/></Button></form><p className="mt-6 text-center text-sm text-slate-500">Already registered? <Link href="/login" className="font-bold text-navy underline">Sign in</Link></p></Card></div></main>;
}
