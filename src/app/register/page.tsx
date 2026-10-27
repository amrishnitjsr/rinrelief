"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button, Card } from "@/components/ui";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
  return <main className="min-h-screen bg-navy px-5 py-12"><div className="mx-auto max-w-md"><Link href="/" className="mx-auto flex w-fit items-center gap-2 text-white"><span className="grid h-10 w-10 place-items-center rounded-xl bg-gold text-navy"><ShieldCheck size={22}/></span><span className="serif text-2xl font-bold">Rinrelife</span></Link><Card className="mt-10 p-7 sm:p-9"><h1 className="serif text-3xl font-bold text-navy">Create your client account</h1><p className="mt-2 text-sm leading-6 text-slate-500">Use the same email and phone number you provide during case intake.</p><form onSubmit={submit} className="mt-7 space-y-4">{[["name","Full name","text"],["email","Email address","email"],["phone","Mobile number","tel"],["password","Password","password"]].map(([key,label,type])=><label key={key} className="grid gap-1.5 text-sm font-semibold text-slate-700">{label}<input required minLength={key==="password"?8:undefined} type={type} value={form[key as keyof typeof form]} onChange={event=>setForm({...form,[key]:event.target.value})} className="rounded-xl border border-slate-200 px-3.5 py-3 font-normal outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"/></label>)}{error&&<p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<Button disabled={loading} className="w-full">{loading?"Creating account...":"Create account"}<ArrowRight size={16}/></Button></form><p className="mt-6 text-center text-sm text-slate-500">Already registered? <Link href="/login" className="font-bold text-navy underline">Sign in</Link></p></Card></div></main>;
}
