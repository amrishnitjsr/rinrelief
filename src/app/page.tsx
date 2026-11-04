"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  BadgeCheck,
  Ban,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileText,
  FolderOpen,
  Gavel,
  Landmark,
  IndianRupee,
  Mail,
  MapPin,
  MessageCircle,
  PhoneCall,
  Scale,
  ShieldAlert,
  Users,
  X,
} from "lucide-react";
import { Button, Card } from "@/components/ui";
import { SiteHeader } from "@/components/site-header";
import { LeadChatbot } from "@/components/lead-chatbot";
import { FeedbackSection } from "@/components/feedback-section";

const protections = [
  ["01", "Recovery harassment", "Stop abusive calls, intimidation, unauthorised visits, and contact with your family.", PhoneCall],
  ["02", "Debt settlement", "Build a realistic offer and negotiate with lenders from a documented position.", Scale],
  ["03", "Legal protection", "Respond to notices, summons, disputes, and unfair conduct with clarity.", ShieldAlert],
  ["04", "Civil disputes", "Get structured guidance for contracts, recovery disputes, property issues, and other civil remedies.", Scale],
  ["05", "Consumer complaints", "Document service failures, defective services, and unfair conduct for the appropriate complaint route.", MessageCircle],
  ["06", "Family matters", "Discuss matrimonial, maintenance, custody, and other sensitive family-law concerns privately.", Users],
  ["07", "Criminal defence", "Understand notices, complaints, and the next step when you need urgent criminal-law support.", Gavel],
  ["08", "Property and agreements", "Review sale, rent, employment, partnership, and other agreements before signing.", ClipboardCheck],
  ["09", "Banking and workplace issues", "Prepare a clear complaint trail for banking, employment, and professional disputes.", Landmark],
  ["10", "Advocate representation", "Coordinate consultations, document review, notices, and representation through your legal team.", Users],
  ["11", "Legal notices", "Review or prepare a timely response to a legal notice, demand, or summons.", FileText],
  ["12", "Evidence and case file", "Organise messages, notices, statements, contracts, and other evidence into a clear case file.", FolderOpen],
];

const serviceGuides: Record<string, { intro: string; steps: string[] }> = {
  "Recovery harassment": {
    intro: "Practical support when recovery calls, threats, or unwanted contact are becoming difficult to manage.",
    steps: ["Share call records, messages, or visit details.", "An advocate reviews the conduct and explains lawful response options.", "Receive a documented communication and protection plan."],
  },
  "Debt settlement": {
    intro: "A structured way to understand your debt position and discuss realistic settlement options.",
    steps: ["Collect loan statements, notices, and payment history.", "Review your outstanding amount and repayment capacity.", "Prepare a documented lender discussion or settlement response."],
  },
  "Legal protection": {
    intro: "Clear guidance when you receive a notice, summons, or face unfair legal pressure.",
    steps: ["Share the notice or relevant communication.", "Understand the deadline, risks, and available responses.", "Plan the next action with advocate support."],
  },
  "Civil disputes": {
    intro: "Focused guidance for contracts, money recovery, property concerns, and other civil disputes.",
    steps: ["Explain the dispute and the outcome you want.", "Review agreements, notices, and supporting evidence.", "Choose a practical response, negotiation, or representation path."],
  },
  "Consumer complaints": {
    intro: "Help with defective products, poor services, refunds, and unfair consumer practices.",
    steps: ["Share invoices, communications, and service records.", "Identify the issue and the appropriate complaint route.", "Prepare a clear complaint or response with supporting evidence."],
  },
  "Family matters": {
    intro: "Private, sensitive guidance for family-law concerns and difficult personal situations.",
    steps: ["Discuss your situation confidentially.", "Understand possible options and immediate priorities.", "Plan documentation, negotiation, mediation, or representation."],
  },
  "Criminal defence": {
    intro: "Urgent guidance for police concerns, notices, summons, and criminal-law matters.",
    steps: ["Share the notice or explain the immediate concern.", "Review deadlines, safety, and urgent legal steps.", "Coordinate advocate consultation and further representation if needed."],
  },
  "Property and agreements": {
    intro: "Review and guidance for property transactions, rent, ownership, and important agreements.",
    steps: ["Share the draft, agreement, or ownership documents.", "Identify obligations, risks, and clauses needing attention.", "Make informed changes or plan the next legal step."],
  },
  "Banking and workplace issues": {
    intro: "Support for banking complaints, employment concerns, salary disputes, and workplace issues.",
    steps: ["Organise statements, emails, contracts, or workplace records.", "Clarify the issue and the responsible complaint channel.", "Prepare a written complaint, response, or consultation plan."],
  },
  "Advocate representation": {
    intro: "Coordinate legal consultation, document review, notices, and representation for your matter.",
    steps: ["Share the background and documents.", "Discuss the scope, timeline, and likely next steps.", "Move forward with a suitable advocate-led plan."],
  },
  "Legal notices": {
    intro: "Understand what a legal notice means and how to respond before a deadline passes.",
    steps: ["Upload or describe the notice and its deadline.", "Review the allegations, obligations, and response options.", "Prepare a measured reply or plan the next action."],
  },
  "Evidence and case file": {
    intro: "Turn scattered messages, documents, and records into a clear, useful case file.",
    steps: ["Collect relevant documents, screenshots, and dates.", "Sort the evidence by issue and importance.", "Create a concise file for consultation, notice, or representation."],
  },
};

export default function Home() {
  const [debt, setDebt] = useState(650000);
  const [months, setMonths] = useState(5);
  const [serviceIndex, setServiceIndex] = useState(0);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const waiver = Math.round(debt * Math.min(0.42, 0.12 + months * 0.035));
  const low = Math.round((debt - waiver) * 0.52);
  const high = Math.round((debt - waiver) * 0.72);
  const changeServices = (nextIndex: number) => (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setServiceIndex(nextIndex);
  };
  const visibleServices = protections.slice(serviceIndex, serviceIndex + 3).concat(
    protections.slice(0, Math.max(0, serviceIndex + 3 - protections.length)),
  );
  useEffect(() => {
    const timer = window.setInterval(() => setServiceIndex((index) => (index + 3) % protections.length), 6_000);
    return () => window.clearInterval(timer);
  }, []);

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
              <h1 className="max-w-4xl text-5xl font-black leading-[.94] tracking-[-.065em] text-espresso sm:text-7xl lg:text-8xl">
                A calmer way to face <span className="text-[#b18a20]">legal problems.</span>
              </h1>
              <p className="mt-8 max-w-xl text-lg leading-8 text-espresso/65">
                Confidential legal guidance, evidence-backed case preparation, and a clear next step for people facing difficult legal situations.
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
            <div className="grid gap-8 sm:grid-cols-2"><p className="text-lg leading-8 text-white/65">We help clients turn confusing legal situations into an organised, evidence-backed case strategy.</p><p className="text-lg leading-8 text-white/65">Our work is designed around privacy, informed choices, and lawful communication—not fear or guaranteed outcomes.</p></div>
          </div>
        </section>

        <section id="protections" className="bg-paper px-5 py-20 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div><p className="text-xs font-bold uppercase tracking-[.22em] text-[#9a7413]">What we do</p><h2 className="mt-4 max-w-2xl text-5xl font-black leading-none tracking-[-.06em] text-espresso sm:text-7xl">A plan for every difficult call.</h2></div>
              <div className="flex w-full items-center justify-between gap-3 pb-2 sm:w-auto sm:justify-end">
                <span className="text-[10px] font-bold uppercase tracking-wider text-espresso/45 sm:text-xs">Services {serviceIndex + 1}–{Math.min(serviceIndex + 3, protections.length)} of {protections.length}</span>
                <button type="button" aria-label="Previous services" onClick={changeServices((serviceIndex - 3 + protections.length) % protections.length)} className="grid h-9 w-9 place-items-center rounded-full border border-espresso/20 text-espresso transition hover:border-gold hover:bg-white"><ChevronLeft size={16} /></button>
                <button type="button" aria-label="Next services" onClick={changeServices((serviceIndex + 3) % protections.length)} className="grid h-9 w-9 place-items-center rounded-full border border-espresso/20 text-espresso transition hover:border-gold hover:bg-white"><ChevronRight size={16} /></button>
              </div>
            </div>
            <div className="mt-14">
              <div className="grid gap-x-4 gap-y-12 md:grid-cols-3">
                {visibleServices.map(([number, title, description, Icon]) => <article key={`${number}-${title}`} className="group border-t border-espresso/20 pt-5"><div className="flex items-center justify-between text-xs font-bold text-espresso/45"><span>{number as string}</span><Icon size={19} className="text-[#9a7413]" /></div><h3 className="mt-7 text-2xl font-black tracking-[-.04em] text-espresso sm:mt-10 sm:text-3xl">{title as string}</h3><p className="mt-3 min-h-20 text-sm leading-6 text-espresso/60 sm:mt-4">{description as string}</p><button type="button" onClick={() => setSelectedService(title as string)} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-espresso sm:mt-7">Learn more <ChevronRight size={15} className="transition group-hover:translate-x-1" /></button></article>)}
              </div>
              <div className="mt-10 flex items-center justify-between border-t border-espresso/15 pt-5">
                <div className="flex gap-1.5" aria-label="Service slides">{Array.from({ length: Math.ceil(protections.length / 3) }, (_, index) => <button key={index} type="button" aria-label={`Show services ${index * 3 + 1} to ${Math.min(index * 3 + 3, protections.length)}`} onClick={changeServices(index * 3)} className={`h-1.5 rounded-full transition-all ${Math.floor(serviceIndex / 3) === index ? "w-8 bg-gold" : "w-3 bg-espresso/20"}`} />)}</div>
                <Link href="/case-intake" className="flex items-center gap-2 text-sm font-bold text-espresso">Start with an advocate <ArrowRight size={16} /></Link>
              </div>
            </div>
          </div>
        </section>
        {selectedService && serviceGuides[selectedService] && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-espresso/45 p-4" role="dialog" aria-modal="true" aria-labelledby="service-guide-title">
            <Card className="max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
              <div className="flex items-start justify-between border-b border-slate-100 p-6 sm:p-7">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.2em] text-[#9a7413]">Service guide</p>
                  <h2 id="service-guide-title" className="serif mt-2 text-3xl font-bold text-navy">{selectedService}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{serviceGuides[selectedService].intro}</p>
                </div>
                <button type="button" onClick={() => setSelectedService(null)} aria-label="Close service guide" className="rounded-full p-2 text-slate-500 hover:bg-slate-100"><X size={20} /></button>
              </div>
              <div className="p-6 sm:p-7">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">What usually happens</p>
                <ol className="mt-4 space-y-4">
                  {serviceGuides[selectedService].steps.map((step, index) => <li key={step} className="flex gap-3 text-sm leading-6 text-slate-700"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#f6ebbf] text-xs font-bold text-[#9a7413]">{index + 1}</span><span>{step}</span></li>)}
                </ol>
                <div className="mt-7 flex flex-wrap justify-end gap-3">
                  <Button variant="outline" onClick={() => setSelectedService(null)}>Close</Button>
                  <Link href="/case-intake"><Button>Start this consultation <ArrowRight size={16} /></Button></Link>
                </div>
              </div>
            </Card>
          </div>
        )}
        <section id="process" className="bg-[#e9e5dc] px-5 py-20 sm:py-28 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.75fr_1.25fr]"><div><p className="text-xs font-bold uppercase tracking-[.22em] text-[#9a7413]">The process</p><h2 className="mt-5 text-5xl font-black leading-none tracking-[-.06em] text-espresso sm:text-6xl">From panic to a paper trail.</h2><p className="mt-6 max-w-sm text-base leading-7 text-espresso/60">A simple three-step path that keeps you informed at every stage.</p></div><div className="divide-y divide-espresso/20 border-y border-espresso/20">{[["01", "Tell us what happened", "Share your lender, overdue details, and any harassment evidence securely."], ["02", "Understand your options", "A legal team reviews your situation and explains a realistic response strategy."], ["03", "Move with confidence", "Track notices, negotiation, settlement documents, and updates from your dashboard."]].map(([number, title, description]) => <div key={number} className="grid gap-4 py-7 sm:grid-cols-[80px_1fr_1fr] sm:items-center"><span className="text-sm font-bold text-[#9a7413]">{number}</span><h3 className="text-2xl font-black tracking-[-.03em] text-espresso">{title}</h3><p className="text-sm leading-6 text-espresso/60">{description}</p></div>)}</div></div>
        </section>
        <FeedbackSection />

        <section id="calculator" className="bg-espresso px-5 py-20 text-white sm:py-28 lg:px-8">        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_.8fr] lg:items-center"><div><p className="text-xs font-bold uppercase tracking-[.22em] text-gold">Start with clarity</p><h2 className="mt-5 max-w-2xl text-5xl font-black leading-none tracking-[-.06em] sm:text-7xl">Understand your options before you act.</h2><p className="mt-6 max-w-lg text-lg leading-8 text-white/60">Every legal matter is different. Share the facts securely and an advocate can help you understand the practical next steps.</p></div><Card className="rounded-[1.75rem] border-white/10 bg-white p-6 text-espresso shadow-2xl sm:p-8"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-espresso/45">Optional debt guide</p><h3 className="mt-2 text-2xl font-black tracking-[-.03em]">Settlement estimate</h3></div><div className="grid h-11 w-11 place-items-center rounded-full bg-[#f6ebbf] text-[#9a7413]"><IndianRupee size={20} /></div></div><div className="mt-8 space-y-7"><label className="block text-sm font-bold">Debt amount <span className="float-right text-lg">₹{debt.toLocaleString("en-IN")}</span><input type="range" min="50000" max="5000000" step="25000" value={debt} onChange={(event) => setDebt(+event.target.value)} className="mt-4 w-full accent-[#b18d20]" /></label><label className="block text-sm font-bold">Overdue duration <span className="float-right text-lg">{months} months</span><input type="range" min="1" max="24" value={months} onChange={(event) => setMonths(+event.target.value)} className="mt-4 w-full accent-[#b18d20]" /></label><div className="rounded-2xl bg-paper p-4 text-sm"><div className="flex justify-between border-b border-espresso/10 pb-3"><span className="text-espresso/55">Estimated waiver</span><b className="text-emerald-700">₹{waiver.toLocaleString("en-IN")}</b></div><div className="flex justify-between pt-3"><span className="text-espresso/55">Settlement range</span><b>₹{low.toLocaleString("en-IN")} – ₹{high.toLocaleString("en-IN")}</b></div></div><Link href="/case-intake"><Button className="w-full rounded-full bg-espresso py-3.5 text-white hover:bg-[#4a3d33]">Discuss any legal matter <ArrowRight size={16} /></Button></Link><p className="text-center text-[11px] text-espresso/40">Illustrative debt guidance only; all legal matters are welcome.</p></div></Card></div></section>
        <section id="contact" className="bg-paper px-5 py-20 sm:py-28 lg:px-8"><div className="mx-auto max-w-7xl"><p className="text-xs font-bold uppercase tracking-[.22em] text-[#9a7413]">Need help now?</p><div className="mt-4 flex flex-wrap items-end justify-between gap-6"><h2 className="max-w-2xl text-5xl font-black leading-none tracking-[-.06em] text-espresso sm:text-7xl">Talk to a real person, your way.</h2><p className="max-w-sm text-base leading-7 text-espresso/60">No long forms are required to ask a question. Call, WhatsApp, or email us. For a full review, start the private intake.</p></div><div className="mt-12 grid gap-4 sm:grid-cols-3"><a href="tel:+919876543210" className="rounded-2xl border border-espresso/15 bg-white p-6 transition hover:border-gold"><PhoneCall className="text-[#9a7413]" size={22} /><h3 className="mt-5 text-xl font-black text-espresso">Call us</h3><p className="mt-2 text-sm text-espresso/60">Speak with our support team.</p><p className="mt-4 font-bold text-espresso">+91 98765 43210</p></a><a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="rounded-2xl border border-espresso/15 bg-white p-6 transition hover:border-gold"><MessageCircle className="text-emerald-600" size={22} /><h3 className="mt-5 text-xl font-black text-espresso">WhatsApp us</h3><p className="mt-2 text-sm text-espresso/60">Send a message when it suits you.</p><p className="mt-4 font-bold text-espresso">Chat securely</p></a><a href="mailto:alerts@nyayashield.in" className="rounded-2xl border border-espresso/15 bg-white p-6 transition hover:border-gold"><Mail className="text-[#9a7413]" size={22} /><h3 className="mt-5 text-xl font-black text-espresso">Email us</h3><p className="mt-2 text-sm text-espresso/60">Share your question privately.</p><p className="mt-4 break-all font-bold text-espresso">alerts@nyayashield.in</p></a></div><div className="mt-8 text-center"><Link href="/case-intake"><Button className="rounded-full bg-espresso px-6 py-3.5 text-white hover:bg-[#4a3d33]">Start full case intake <ArrowRight size={16} /></Button></Link></div></div></section>
      </main>
      <footer className="bg-espresso px-5 py-14 text-white sm:py-16 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.2fr_.8fr_.8fr]">
          <div>
            <div className="flex items-center gap-2.5"><span className="grid h-10 w-10 place-items-center rounded-full bg-white text-espresso"><ShieldAlert size={20} /></span><span className="text-xl font-black">Rinrelife</span></div>
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/60">Confidential legal guidance and case preparation for clients across India.</p>
            <p className="mt-5 text-xs font-bold uppercase tracking-wider text-gold">Demo contact details — replace before launch</p>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-gold">Office</h3>
            <div className="mt-4 flex gap-3 text-sm leading-6 text-white/70"><MapPin size={18} className="mt-1 shrink-0 text-gold" /><p>Demo Office, 2nd Floor<br />Connaught Place, New Delhi<br />Delhi 110001, India</p></div>
            <p className="mt-4 text-sm text-white/60">Mon–Sat · 10:00 AM–6:00 PM</p>
            <a href="https://maps.google.com/?q=Connaught+Place+New+Delhi" target="_blank" rel="noreferrer" className="mt-4 inline-flex text-sm font-bold text-gold hover:text-white">View demo location</a>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-gold">Explore</h3>
            <div className="mt-4 grid gap-3 text-sm text-white/70"><Link href="/#about" className="hover:text-white">About us</Link><Link href="/#feedback" className="hover:text-white">Client feedback</Link><Link href="/case-intake" className="hover:text-white">Start intake</Link><Link href="/login?role=client" className="hover:text-white">Client login</Link></div>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-5 text-xs text-white/40">© {new Date().getFullYear()} Rinrelife. Information is for general guidance and does not guarantee an outcome.</div>
      </footer>
      <div className="fixed bottom-5 right-3 z-40 flex flex-col gap-2 sm:right-5 sm:gap-3"><a href="tel:+919876543210" className="grid h-11 w-11 place-items-center rounded-full bg-red-600 text-white shadow-lg sm:h-12 sm:w-12" aria-label="Emergency helpline"><PhoneCall size={19} /></a><a href="https://wa.me/919876543210" className="grid h-11 w-11 place-items-center rounded-full bg-emerald-600 text-white shadow-lg sm:h-12 sm:w-12" aria-label="WhatsApp support"><MessageCircle size={20} /></a></div>
      <LeadChatbot />
    </>
  );
}
