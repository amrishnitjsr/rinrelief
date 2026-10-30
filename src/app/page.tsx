"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  BadgeCheck,
  Ban,
  Check,
  ChevronRight,
  IndianRupee,
  Mail,
  MessageCircle,
  PhoneCall,
  Scale,
  ShieldAlert,
  Users,
} from "lucide-react";
import { Button, Card } from "@/components/ui";
import { SiteHeader } from "@/components/site-header";
import { LeadChatbot } from "@/components/lead-chatbot";

const protections = [
  ["01", "Recovery harassment", "Stop abusive calls, intimidation, unauthorised visits, and contact with your family.", PhoneCall],
  ["02", "Debt settlement", "Build a realistic offer and negotiate with lenders from a documented position.", Scale],
  ["03", "Legal protection", "Respond to notices, Section 138 summons, and unfair recovery practices with clarity.", ShieldAlert],
];

export default function Home() {
  const [debt, setDebt] = useState(650000);
  const [months, setMonths] = useState(5);
  const waiver = Math.round(debt * Math.min(0.42, 0.12 + months * 0.035));
  const low = Math.round((debt - waiver) * 0.52);
  const high = Math.round((debt - waiver) * 0.72);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden bg-paper pb-16 pt-36 sm:pb-24 sm:pt-44">
          <div className="absolute -left-40 top-40 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
          <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[1.05fr_.95fr] lg:items-end lg:px-8">
            <div className="relative">
              <p className="mb-7 flex items-center gap-3 text-xs font-bold uppercase tracking-[.22em] text-[#9a7413]">
                <span className="h-px w-8 bg-gold" /> Confidential legal consultancy
              </p>
              <h1 className="max-w-4xl text-6xl font-black leading-[.94] tracking-[-.065em] text-espresso sm:text-8xl">
                A calmer way to face <span className="text-[#b18a20]">debt.</span>
              </h1>
              <p className="mt-8 max-w-xl text-lg leading-8 text-espresso/65">
                Strategic settlement, evidence-backed harassment protection, and a clear legal path for borrowers who need room to breathe.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link href="/case-intake">
                  <Button className="rounded-full bg-espresso px-6 py-3.5 text-white hover:bg-[#4a3d33]">Start confidential intake <ArrowRight size={16} /></Button>
                </Link>
                <Link href="#about" className="flex items-center gap-2 text-sm font-bold text-espresso">
                  Explore our approach <ArrowDownRight size={17} />
                </Link>
              </div>
              <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-espresso/15 pt-5 text-xs font-bold uppercase tracking-wider text-espresso/55">
                <span className="flex items-center gap-2"><BadgeCheck size={16} className="text-[#9a7413]" /> RBI-aligned</span>
                <span className="flex items-center gap-2"><ShieldAlert size={16} className="text-[#9a7413]" /> Evidence-led</span>
                <span className="flex items-center gap-2"><ShieldAlert size={16} className="text-[#9a7413]" /> Private by design</span>
              </div>
            </div>
            <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] bg-espresso p-6 text-white sm:min-h-[520px] sm:p-9">
              <div className="absolute right-[-15%] top-[-12%] h-72 w-72 rounded-full border-[36px] border-gold/20" />
              <div className="absolute bottom-[-15%] left-[-12%] h-64 w-64 rounded-full bg-[#71604e]/40 blur-2xl" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-start justify-between">
                  <span className="rounded-full border border-white/20 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white/65">The shield desk</span>
                  <span className="text-5xl font-black tracking-[-.08em] text-gold/80">NS</span>
                </div>
                <div className="mt-24 max-w-sm">
                  <p className="text-xs font-bold uppercase tracking-[.2em] text-gold">Your situation is solvable</p>
                  <h2 className="mt-4 text-4xl font-black leading-[.98] tracking-[-.04em] sm:text-5xl">Good advice starts with listening.</h2>
                  <p className="mt-5 text-sm leading-6 text-white/60">No judgement. No false promises. Just a structured next step.</p>
                </div>
                <div className="mt-10 flex items-center justify-between border-t border-white/15 pt-5 text-xs text-white/60">
                  <span>Private client intake</span><span>01 — 03</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="bg-espresso px-5 py-20 text-white sm:py-28 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
            <div><p className="text-xs font-bold uppercase tracking-[.22em] text-gold">Why Rinrelife</p><h2 className="mt-5 text-4xl font-black leading-none tracking-[-.05em] sm:text-6xl">Legal clarity, without the courtroom noise.</h2></div>
            <div className="grid gap-8 sm:grid-cols-2"><p className="text-lg leading-8 text-white/65">We help borrowers turn overwhelming recovery pressure into an organised, evidence-backed case strategy.</p><p className="text-lg leading-8 text-white/65">Our work is designed around privacy, informed choices, and lawful communication—not fear or guaranteed outcomes.</p></div>
          </div>
        </section>

        <section id="protections" className="bg-paper px-5 py-20 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-wrap items-end justify-between gap-6"><div><p className="text-xs font-bold uppercase tracking-[.22em] text-[#9a7413]">What we do</p><h2 className="mt-4 max-w-2xl text-5xl font-black leading-none tracking-[-.06em] text-espresso sm:text-7xl">A plan for every difficult call.</h2></div><Link href="/case-intake" className="flex items-center gap-2 pb-2 text-sm font-bold text-espresso">View all services <ArrowRight size={16} /></Link></div>
            <div className="mt-14 grid gap-4 md:grid-cols-3">{protections.map(([number, title, description, Icon]) => <article key={title as string} className="group border-t border-espresso/20 pt-5"><div className="flex items-center justify-between text-xs font-bold text-espresso/45"><span>{number as string}</span><Icon size={19} className="text-[#9a7413]" /></div><h3 className="mt-14 text-3xl font-black tracking-[-.04em] text-espresso">{title as string}</h3><p className="mt-4 min-h-20 text-sm leading-6 text-espresso/60">{description as string}</p><Link href="/case-intake" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-espresso">Learn more <ChevronRight size={15} className="transition group-hover:translate-x-1" /></Link></article>)}</div>
          </div>
        </section>

        <section id="process" className="bg-[#e9e5dc] px-5 py-20 sm:py-28 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.75fr_1.25fr]"><div><p className="text-xs font-bold uppercase tracking-[.22em] text-[#9a7413]">The process</p><h2 className="mt-5 text-5xl font-black leading-none tracking-[-.06em] text-espresso sm:text-6xl">From panic to a paper trail.</h2><p className="mt-6 max-w-sm text-base leading-7 text-espresso/60">A simple three-step path that keeps you informed at every stage.</p></div><div className="divide-y divide-espresso/20 border-y border-espresso/20">{[["01", "Tell us what happened", "Share your lender, overdue details, and any harassment evidence securely."], ["02", "Understand your options", "A legal team reviews your situation and explains a realistic response strategy."], ["03", "Move with confidence", "Track notices, negotiation, settlement documents, and updates from your dashboard."]].map(([number, title, description]) => <div key={number} className="grid gap-4 py-7 sm:grid-cols-[80px_1fr_1fr] sm:items-center"><span className="text-sm font-bold text-[#9a7413]">{number}</span><h3 className="text-2xl font-black tracking-[-.03em] text-espresso">{title}</h3><p className="text-sm leading-6 text-espresso/60">{description}</p></div>)}</div></div>
        </section>

        <section id="calculator" className="bg-espresso px-5 py-20 text-white sm:py-28 lg:px-8"><div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_.8fr] lg:items-center"><div><p className="text-xs font-bold uppercase tracking-[.22em] text-gold">Start with an estimate</p><h2 className="mt-5 max-w-2xl text-5xl font-black leading-none tracking-[-.06em] sm:text-7xl">Know what a realistic settlement may look like.</h2><p className="mt-6 max-w-lg text-lg leading-8 text-white/60">Use this illustrative calculator to understand possible waiver and settlement ranges before your consultation.</p></div><Card className="rounded-[1.75rem] border-white/10 bg-white p-6 text-espresso shadow-2xl sm:p-8"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-espresso/45">Quick estimate</p><h3 className="mt-2 text-2xl font-black tracking-[-.03em]">Settlement calculator</h3></div><div className="grid h-11 w-11 place-items-center rounded-full bg-[#f6ebbf] text-[#9a7413]"><IndianRupee size={20} /></div></div><div className="mt-8 space-y-7"><label className="block text-sm font-bold">Total outstanding <span className="float-right text-lg">₹{debt.toLocaleString("en-IN")}</span><input type="range" min="50000" max="5000000" step="25000" value={debt} onChange={(event) => setDebt(+event.target.value)} className="mt-4 w-full accent-[#b18d20]" /></label><label className="block text-sm font-bold">Overdue duration <span className="float-right text-lg">{months} months</span><input type="range" min="1" max="24" value={months} onChange={(event) => setMonths(+event.target.value)} className="mt-4 w-full accent-[#b18d20]" /></label><div className="rounded-2xl bg-paper p-4 text-sm"><div className="flex justify-between border-b border-espresso/10 pb-3"><span className="text-espresso/55">Estimated waiver</span><b className="text-emerald-700">₹{waiver.toLocaleString("en-IN")}</b></div><div className="flex justify-between pt-3"><span className="text-espresso/55">Settlement range</span><b>₹{low.toLocaleString("en-IN")} – ₹{high.toLocaleString("en-IN")}</b></div></div><Link href="/case-intake"><Button className="w-full rounded-full bg-espresso py-3.5 text-white hover:bg-[#4a3d33]">Get a personalised plan <ArrowRight size={16} /></Button></Link><p className="text-center text-[11px] text-espresso/40">Illustrative only and subject to lender review.</p></div></Card></div></section>
        <section id="contact" className="bg-paper px-5 py-20 sm:py-28 lg:px-8"><div className="mx-auto max-w-7xl"><p className="text-xs font-bold uppercase tracking-[.22em] text-[#9a7413]">Need help now?</p><div className="mt-4 flex flex-wrap items-end justify-between gap-6"><h2 className="max-w-2xl text-5xl font-black leading-none tracking-[-.06em] text-espresso sm:text-7xl">Talk to a real person, your way.</h2><p className="max-w-sm text-base leading-7 text-espresso/60">No long forms are required to ask a question. Call, WhatsApp, or email us. For a full review, start the private intake.</p></div><div className="mt-12 grid gap-4 sm:grid-cols-3"><a href="tel:+919876543210" className="rounded-2xl border border-espresso/15 bg-white p-6 transition hover:border-gold"><PhoneCall className="text-[#9a7413]" size={22} /><h3 className="mt-5 text-xl font-black text-espresso">Call us</h3><p className="mt-2 text-sm text-espresso/60">Speak with our support team.</p><p className="mt-4 font-bold text-espresso">+91 98765 43210</p></a><a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="rounded-2xl border border-espresso/15 bg-white p-6 transition hover:border-gold"><MessageCircle className="text-emerald-600" size={22} /><h3 className="mt-5 text-xl font-black text-espresso">WhatsApp us</h3><p className="mt-2 text-sm text-espresso/60">Send a message when it suits you.</p><p className="mt-4 font-bold text-espresso">Chat securely</p></a><a href="mailto:alerts@nyayashield.in" className="rounded-2xl border border-espresso/15 bg-white p-6 transition hover:border-gold"><Mail className="text-[#9a7413]" size={22} /><h3 className="mt-5 text-xl font-black text-espresso">Email us</h3><p className="mt-2 text-sm text-espresso/60">Share your question privately.</p><p className="mt-4 break-all font-bold text-espresso">alerts@nyayashield.in</p></a></div><div className="mt-8 text-center"><Link href="/case-intake"><Button className="rounded-full bg-espresso px-6 py-3.5 text-white hover:bg-[#4a3d33]">Start full case intake <ArrowRight size={16} /></Button></Link></div></div></section>
      </main>
      <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-3"><a href="tel:+919876543210" className="grid h-12 w-12 place-items-center rounded-full bg-red-600 text-white shadow-lg" aria-label="Emergency helpline"><PhoneCall size={20} /></a><a href="https://wa.me/919876543210" className="grid h-12 w-12 place-items-center rounded-full bg-emerald-600 text-white shadow-lg" aria-label="WhatsApp support"><MessageCircle size={21} /></a></div>
      <LeadChatbot />
    </>
  );
}
