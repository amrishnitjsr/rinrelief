import Link from "next/link";
import { ArrowRight, Menu, ShieldCheck } from "lucide-react";

export function SiteHeader() {
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
          <Link href="/case-intake" className="hidden items-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-bold text-espresso transition hover:bg-[#e9c84f] sm:flex">
            Contact us <ArrowRight size={15} />
          </Link>
          <Link href="/case-intake" aria-label="Open confidential intake" className="grid h-10 w-10 place-items-center rounded-full text-white sm:hidden">
            <Menu size={21} />
          </Link>
        </div>
      </div>
    </header>
  );
}
