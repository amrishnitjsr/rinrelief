"use client";

import Link from "next/link";
import { ArrowRight, ChevronDown, ShieldCheck } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

export function SiteHeader() {
  const { data: session, status } = useSession();
  const [profileOpen, setProfileOpen] = useState(false);
  const isClient = session?.user?.role === "CLIENT";
  return (
    <header className="absolute inset-x-0 top-0 z-30 px-4 pt-5 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full bg-espresso px-5 py-2.5 text-white shadow-xl shadow-black/10">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-espresso">
            <ShieldCheck size={21} />
          </span>
          <span className="text-lg font-black tracking-tight">
            Rinrelife
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-white/80 lg:flex">
          <Link className="transition hover:text-white" href="/">Home</Link>
          <Link className="transition hover:text-white" href="/#about">About us</Link>
          <Link className="transition hover:text-white" href="/#protections">Services</Link>
          <Link className="transition hover:text-white" href="/#process">How it works</Link>
          <Link className="transition hover:text-white" href="/dashboard">Track case</Link>
        </nav>
        <div className="flex items-center gap-2">
          {status !== "loading" && (isClient ? <div className="relative"><button type="button" onClick={() => setProfileOpen((open) => !open)} className="flex items-center gap-2 rounded-full border border-white/30 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"><span className="grid h-6 w-6 place-items-center rounded-full bg-gold text-xs text-espresso">{(session.user.name ?? session.user.email ?? "U").slice(0, 1).toUpperCase()}</span><span className="hidden sm:inline">{session.user.name ?? "My profile"}</span><ChevronDown size={15} /></button>{profileOpen && <div className="absolute right-0 top-12 w-48 rounded-2xl bg-white p-2 text-sm text-navy shadow-xl"><Link href="/dashboard" className="block rounded-xl px-3 py-2 font-semibold hover:bg-slate-100">My dashboard</Link><button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="w-full rounded-xl px-3 py-2 text-left font-semibold text-red-600 hover:bg-red-50">Sign out</button></div>}</div> : <Link href="/login?role=client" className="hidden items-center gap-2 rounded-full border border-white/30 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10 sm:flex">Client login</Link>)}
          <Link href="/#contact" className="hidden items-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-bold text-espresso transition hover:bg-[#e9c84f] md:flex">
            Talk to us <ArrowRight size={15} />
          </Link>
          {!isClient && <Link href="/login?role=client" aria-label="Client login" className="rounded-full border border-white/30 px-3 py-2 text-xs font-bold text-white sm:hidden">Login</Link>}
        </div>
      </div>
    </header>
  );
}
