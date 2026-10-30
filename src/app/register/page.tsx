"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui";

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
  return <main className="min-h-screen bg-navy px-5 py-12"><div className="mx-auto max-w-md"><Link href="/" className="mx-auto flex w-fit items-center gap-2 text-white"><span className="grid h-10 w-10 place-items-center rounded-xl bg-gold text-navy"><ShieldCheck size={22}/></span><span className="serif text-2xl font-bold">Rinrelife</span></Link><Card className="mt-10 p-7 text-center sm:p-9"><h1 className="serif text-3xl font-bold text-navy">Client account access</h1><p className="mt-4 text-sm leading-7 text-slate-500">Client login credentials are created only by an administrator after your consultation and fee agreement.</p><p className="mt-3 text-sm leading-7 text-slate-500">Your admin will share a case ID, login email, and temporary password securely.</p><Link href="/login" className="mt-7 inline-flex rounded-xl bg-navy px-4 py-3 text-sm font-semibold text-white">Go to client login</Link></Card></div></main>;
}
