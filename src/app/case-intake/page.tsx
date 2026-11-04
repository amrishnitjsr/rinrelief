"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileAudio,
  FileImage,
  FileText,
  LockKeyhole,
  MessageCircle,
  PhoneCall,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import { Badge, Button, Card, Field } from "@/components/ui";
import { SiteHeader } from "@/components/site-header";
import { formatCaseWhatsAppMessage, openAdminWhatsApp } from "@/lib/whatsapp";

type FormData = {
  matterType: "" | "Debt settlement" | "Banking" | "Civil dispute" | "Consumer" | "Family" | "Criminal" | "Property" | "Employment" | "Business" | "Cybercrime" | "Other";
  matterSummary: string;
  matterSubtype: string;
  matterContext: string;
  urgency: string;
  lender: string;
  loanType: "" | "Personal Loan" | "Credit Card" | "Instant App Loan" | "Business Loan";
  amount: string;
  principal: string;
  months: string;
  harassment: "yes" | "no";
  violations: string[];
  notice: "yes" | "no" | "not sure";
  name: string;
  mobile: string;
  city: string;
  email: string;
};

const steps = ["Matter details", "Evidence (optional)", "Your consultation"];
const matterTypeMap: Record<Exclude<FormData["matterType"], "">, string> = {
  "Debt settlement": "DEBT_SETTLEMENT",
  Banking: "BANKING",
  "Civil dispute": "CIVIL_DISPUTE",
  Consumer: "CONSUMER",
  Family: "FAMILY",
  Criminal: "CRIMINAL",
  Property: "PROPERTY",
  Employment: "EMPLOYMENT",
  Business: "BUSINESS",
  Cybercrime: "CYBERCRIME",
  Other: "OTHER",
};
const matterOptions: Record<Exclude<FormData["matterType"], "">, { label: string; options: string[] }> = {
  "Debt settlement": { label: "What kind of debt or loan is involved?", options: ["Personal loan", "Credit card", "Instant/app loan", "Business loan", "Home or auto loan", "Multiple debts", "Other debt"] },
  Banking: { label: "What banking issue are you facing?", options: ["Account or transaction dispute", "Loan servicing issue", "Fraud or unauthorised transaction", "Banking complaint", "Other banking issue"] },
  "Civil dispute": { label: "What type of civil dispute is this?", options: ["Contract dispute", "Money recovery", "Neighbour or boundary dispute", "Defamation", "Other civil dispute"] },
  Consumer: { label: "What consumer issue do you have?", options: ["Defective product", "Poor service", "Refund or charge dispute", "Online purchase issue", "Other consumer issue"] },
  Family: { label: "What family-law help do you need?", options: ["Divorce or separation", "Maintenance", "Child custody", "Domestic violence", "Property or inheritance", "Other family matter"] },
  Criminal: { label: "What criminal-law support do you need?", options: ["Police complaint or FIR", "Bail or arrest concern", "Criminal notice or summons", "Cyber-related offence", "Other criminal matter"] },
  Property: { label: "What property matter is involved?", options: ["Sale or purchase", "Rent or tenancy", "Title or ownership", "Boundary or possession", "Property fraud", "Other property matter"] },
  Employment: { label: "What employment issue are you facing?", options: ["Termination", "Salary or dues", "Workplace harassment", "Employment contract", "Other employment matter"] },
  Business: { label: "What business-law help do you need?", options: ["Partnership dispute", "Business contract", "Company or compliance", "Vendor or payment dispute", "Other business matter"] },
  Cybercrime: { label: "What cyber issue occurred?", options: ["Online fraud", "Account or identity theft", "Harassment or blackmail", "Data or privacy breach", "Other cyber matter"] },
  Other: { label: "What area best describes your matter?", options: ["Legal notice", "Document review", "Representation", "Urgent legal advice", "Other"] },
};
const urgencyOptions: Record<Exclude<FormData["matterType"], "">, string[]> = {
  "Debt settlement": ["Active recovery calls or threats", "Legal notice or summons received", "Payment deadline approaching", "General guidance"],
  Banking: ["Account or funds blocked", "Fraud or unauthorised transaction", "Complaint deadline approaching", "General guidance"],
  "Civil dispute": ["Court or legal notice received", "Hearing or deadline approaching", "Active dispute or threat", "General guidance"],
  Consumer: ["Product/service deadline approaching", "Money urgently blocked or lost", "Notice received", "General guidance"],
  Family: ["Immediate safety concern", "Court or mediation date approaching", "Urgent custody or maintenance issue", "General guidance"],
  Criminal: ["Arrest or immediate police concern", "Notice, FIR, or summons received", "Court date approaching", "General guidance"],
  Property: ["Eviction or possession risk", "Registration or payment deadline", "Notice or active dispute", "General guidance"],
  Employment: ["Termination or suspension concern", "Salary or dues urgently needed", "Notice or deadline received", "General guidance"],
  Business: ["Business operations at risk", "Contract or payment deadline", "Notice or active dispute", "General guidance"],
  Cybercrime: ["Money recently lost", "Account currently compromised", "Threat or blackmail ongoing", "General guidance"],
  Other: ["Immediate deadline or risk", "Notice or summons received", "General guidance"],
};
const loanTypeMap: Record<Exclude<FormData["loanType"], "">, string> = {
  "Personal Loan": "PERSONAL_LOAN",
  "Credit Card": "CREDIT_CARD",
  "Instant App Loan": "APP_LOAN_INSTANT",
  "Business Loan": "BUSINESS_LOAN",
};

function getHarassmentType(violations: string[]): string | undefined {
  if (violations.length === 0) return "NONE";
  if (violations.length > 1) return "MULTIPLE_VIOLATIONS";
  if (violations[0].includes("phone")) return "ABUSIVE_CALLS";
  if (violations[0].includes("WhatsApp")) return "THREATENING_MESSAGES";
  if (violations[0].includes("home")) return "HOME_OFFICE_VISITS";
  return "DEFAMATION_CONTACTS_CALLING";
}

export default function CaseIntake() {
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [caseDetails, setCaseDetails] = useState<{ id: string; caseNumber: string }>();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, trigger, watch } = useForm<FormData>({
    defaultValues: { matterType: "", matterSubtype: "", matterContext: "", urgency: "", harassment: "no", notice: "no", violations: [] },
  });
  const selectedMatter = watch("matterType");

  const next = async () => {
    const fields: Record<number, (keyof FormData)[]> = {
      0: ["matterType", "matterSubtype", "matterContext", "urgency", "matterSummary"],
      1: [],
      2: [],
    };
    if (!(await trigger(fields[step]))) return;
    setStep((current) => Math.min(2, current + 1));
  };

  const submitCase = async (data: FormData) => {
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: data.name,
          clientEmail: data.email,
          clientPhone: data.mobile,
          city: data.city,
          matterType: matterTypeMap[data.matterType as Exclude<FormData["matterType"], "">],
          matterSummary: data.matterSummary,
          matterDetails: { subtype: data.matterSubtype, context: data.matterContext, urgency: data.urgency },
          bankOrLenderName: data.lender || undefined,
          loanType: data.loanType ? loanTypeMap[data.loanType] : undefined,
          totalOutstanding: data.amount ? Number(data.amount) : undefined,
          principalAmount: data.principal ? Number(data.principal) : undefined,
          overdueDurationDays: data.months ? Number(data.months) * 30 : 0,
          facingHarassment: data.harassment === "yes",
          harassmentType: getHarassmentType(data.violations),
          harassmentDetails: data.violations.join(", "),
          receivedLegalNotice: data.notice === "yes",
        }),
      });
      const result = (await response.json()) as { id?: string; caseNumber?: string; error?: string };
      if (!response.ok || !result.id || !result.caseNumber) {
        setError(result.error ?? "We could not submit your case. Please try again.");
        return;
      }
      openAdminWhatsApp(formatCaseWhatsAppMessage({
        caseNumber: result.caseNumber,
        name: data.name,
        phone: data.mobile,
        matterType: data.matterType,
        matterSummary: data.matterSummary,
        lender: data.lender,
        loanType: data.loanType,
        outstanding: data.amount,
        overdueMonths: data.months,
        city: data.city,
        inquiry: `${data.violations.length ? data.violations.join(", ") : "No harassment reported"}; legal notice: ${data.notice}`,
      }));
      setCaseDetails({ id: result.id, caseNumber: result.caseNumber });
    } catch {
      setError("We could not submit your case. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (caseDetails) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-2xl px-5 py-20 lg:px-8">
          <Card className="p-8 text-center sm:p-12">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-700">
              <Check size={30} />
            </div>
            <p className="mt-6 text-sm font-bold uppercase tracking-[.16em] text-[#9b7b18]">Inquiry received</p>
            <h1 className="serif mt-3 text-4xl font-bold text-navy">Your legal shield is now in review.</h1>
            <p className="mt-4 leading-7 text-slate-600">
              Your case has been submitted for review. A case manager will contact you shortly. If this is urgent,
              request a call now.
            </p>
            <div className="mt-7 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Private case ID</p>
              <p className="mt-2 break-all font-mono text-lg font-bold text-navy">{caseDetails.caseNumber}</p>
            </div>
            <div className="mt-6 rounded-2xl border border-[#ead99a] bg-[#fffdf4] p-5 text-left">
              <p className="text-sm font-bold text-navy">What happens next?</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                A case manager will review your details and contact you to discuss consultation and fee options.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <a
                  href={`https://wa.me/919876543210?text=${encodeURIComponent(`Urgent callback request for case ${caseDetails.caseNumber}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 px-4 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50"
                >
                  <MessageCircle size={16} /> Request urgent call
                </a>
                <a
                  href="tel:+919876543210"
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-bold text-red-700 transition hover:bg-red-50"
                >
                  <PhoneCall size={16} /> Call urgently
                </a>
              </div>
            </div>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/">
                <Button variant="outline">Return home</Button>
              </Link>
              <Link href="/login">
                <Button>Track my case <ArrowRight size={16} /></Button>
              </Link>
            </div>
          </Card>
        </main>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-12 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[.16em] text-[#9b7b18]">Private case intake</p>
          <h1 className="serif mt-3 text-4xl font-bold text-navy sm:text-5xl">Let’s replace uncertainty with a plan.</h1>
          <p className="mt-4 leading-7 text-slate-600">
            Takes about 4 minutes. Your information is encrypted and reviewed only by our legal team.
          </p>
        </div>
        <div className="mx-auto mt-10 flex max-w-3xl items-center justify-between">
          {steps.map((label, index) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`grid h-9 w-9 place-items-center rounded-full text-sm font-bold ${index < step ? "bg-emerald-600 text-white" : index === step ? "bg-navy text-white" : "bg-slate-200 text-slate-500"}`}>
                {index < step ? <Check size={16} /> : index + 1}
              </div>
              <span className="hidden text-xs font-semibold text-slate-600 sm:block">{label}</span>
              {index < 3 && <div className={`hidden h-px w-8 sm:block md:w-20 ${index < step ? "bg-emerald-500" : "bg-slate-200"}`} />}
            </div>
          ))}
        </div>
        <Card className="mx-auto mt-10 max-w-3xl p-6 sm:p-9">
          <form onSubmit={handleSubmit(submitCase)}>
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="loan" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <StepTitle title="Tell us about your legal matter" subtitle="Choose a matter type to see the questions relevant to your situation." />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="grid gap-1.5 text-sm font-semibold text-slate-700 sm:col-span-2">
                      Legal matter type
                      <select className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 font-normal" {...register("matterType", { required: true })}>
                        <option value="">Select a matter type</option>
                        {Object.keys(matterTypeMap).filter((type) => type !== "").map((type) => <option key={type}>{type}</option>)}
                      </select>
                    </label>
                    {selectedMatter && (
                      <div className="grid gap-4 rounded-2xl border border-[#ead99a] bg-[#fffdf4] p-4 sm:col-span-2">
                        <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
                          {matterOptions[selectedMatter as Exclude<FormData["matterType"], "">].label}
                          <select className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 font-normal" {...register("matterSubtype", { required: true })}>
                            <option value="">Select an option</option>
                            {matterOptions[selectedMatter as Exclude<FormData["matterType"], "">].options.map((option) => <option key={option}>{option}</option>)}
                          </select>
                        </label>
                        <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
                          Tell us a little more about this matter
                          <textarea rows={3} placeholder="Add relevant names, dates, amount, notice, deadline, or other helpful details." className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 font-normal outline-none focus:border-gold" {...register("matterContext", { required: true, minLength: 10 })} />
                        </label>
                        <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
                          What needs attention first?
                          <select className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 font-normal" {...register("urgency", { required: true })}>
                            <option value="">Select urgency</option>
                            {urgencyOptions[selectedMatter as Exclude<FormData["matterType"], "">].map((option) => <option key={option}>{option}</option>)}
                          </select>
                        </label>
                      </div>
                    )}
                    <label className="grid gap-1.5 text-sm font-semibold text-slate-700 sm:col-span-2">
                      What happened?
                      <textarea rows={4} placeholder="Briefly describe your legal issue, what you need, and any urgent deadline." className="rounded-xl border border-slate-200 px-3.5 py-3 font-normal outline-none focus:border-gold" {...register("matterSummary", { required: true, minLength: 10 })} />
                    </label>
                    <label className="grid gap-1.5 text-sm font-semibold text-slate-700 sm:col-span-2">
                      Other party / organisation <span className="font-normal text-slate-400">(optional)</span>
                      <input placeholder="Person, company, bank, employer, landlord, or other party" className="rounded-xl border border-slate-200 px-3.5 py-3 font-normal outline-none focus:border-gold" {...register("lender")} />
                    </label>
                    {selectedMatter === "Debt settlement" && <div className="sm:col-span-2">
                      <p className="mb-2 text-sm font-semibold text-slate-700">Loan type</p>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {(["Personal Loan", "Credit Card", "Instant App Loan", "Business Loan"] as const).map((type) => (
                          <label key={type} className="cursor-pointer">
                            <input type="radio" className="peer sr-only" value={type} {...register("loanType")} />
                            <span className="block rounded-xl border border-slate-200 p-3 text-center text-xs font-semibold peer-checked:border-gold peer-checked:bg-[#fdf9ed]">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>}
                    {selectedMatter === "Debt settlement" && <>
                      <Field label="Amount involved (₹)" type="number" min="1" placeholder="Optional" {...register("amount")} />
                      <Field label="Principal amount (₹)" type="number" min="1" placeholder="Optional" {...register("principal")} />
                      <Field label="How long overdue? (months)" type="number" min="0" placeholder="Optional" {...register("months")} />
                    </>}
                    {selectedMatter === "Debt settlement" && <div className="grid gap-4 sm:col-span-2 sm:grid-cols-2">
                      <div>
                        <p className="mb-2 text-sm font-semibold text-slate-700">Are recovery agents abusing or threatening you?</p>
                        <div className="flex gap-3">{(["yes", "no"] as const).map((value) => <label key={value} className="cursor-pointer"><input type="radio" className="peer sr-only" value={value} {...register("harassment")} /><span className="block rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold capitalize peer-checked:border-gold peer-checked:bg-[#fdf9ed]">{value}</span></label>)}</div>
                      </div>
                      <div>
                        <p className="mb-2 text-sm font-semibold text-slate-700">Have you received a legal notice or summons?</p>
                        <div className="flex gap-2">{(["yes", "no", "not sure"] as const).map((value) => <label key={value} className="cursor-pointer"><input type="radio" className="peer sr-only" value={value} {...register("notice")} /><span className="block rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold capitalize peer-checked:border-gold peer-checked:bg-[#fdf9ed]">{value}</span></label>)}</div>
                      </div>
                    </div>}
                  </div>
                </motion.div>
              )}
              {step === 1 && (
                <motion.div key="evidence" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <StepTitle title="Build your evidence locker" subtitle="Select files now; a case manager will confirm secure upload access after review." />
                  <label className="flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-gold">
                    <UploadCloud className="text-[#b18d20]" size={34} />
                    <p className="mt-3 font-bold text-navy">Drop files here or browse</p>
                    <p className="mt-1 text-xs text-slate-500">MP3, M4A, JPG, PNG or PDF · up to 25 MB each</p>
                    <input type="file" multiple accept=".mp3,.m4a,.jpg,.jpeg,.png,.pdf" className="sr-only" onChange={(event) => setFiles(Array.from(event.target.files ?? []))} />
                  </label>
                  <div className="mt-4 grid gap-3">{files.map((file) => <div key={`${file.name}-${file.size}`} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3"><div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-600">{file.type.includes("audio") ? <FileAudio size={17} /> : file.type.includes("image") ? <FileImage size={17} /> : <FileText size={17} />}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{file.name}</p><p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB · Ready for secure upload</p></div><Badge tone="gold">Selected</Badge></div>)}</div>
                  <div className="mt-5 flex items-center gap-2 text-xs text-slate-500"><LockKeyhole size={15} /> Files are not sent until you submit the case.</div>
                </motion.div>
              )}
              {step === 2 && (
                <motion.div key="contact" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <StepTitle title="Where should we reach you?" subtitle="A senior case manager will call after reviewing your case details." />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Borrower name" placeholder="Full legal name" {...register("name", { required: true })} />
                    <Field label="Mobile number" placeholder="+91 98765 43210" {...register("mobile", { required: true })} />
                    <Field label="City" placeholder="e.g. Mumbai" {...register("city", { required: true })} />
                    <Field label="Email" type="email" placeholder="you@example.com" {...register("email", { required: true })} />
                  </div>
                  <Card className="mt-7 border-[#ead99a] bg-[#fffdf4] p-5 shadow-none"><div><p className="text-xs font-bold uppercase tracking-wider text-[#9b7b18]">Next step</p><h3 className="serif mt-1 text-2xl font-bold text-navy">Initial case review</h3></div><div className="mt-4 space-y-2 text-sm text-slate-600"><p className="flex items-center gap-2"><Check size={15} className="text-emerald-600" /> An advocate reviews your matter</p><p className="flex items-center gap-2"><Check size={15} className="text-emerald-600" /> Practical next steps explained</p><p className="flex items-center gap-2"><Check size={15} className="text-emerald-600" /> Consultation and fee options explained directly</p></div></Card>
                </motion.div>
              )}
            </AnimatePresence>
            {error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">{error}</p>}
            <div className="mt-8 flex justify-between border-t border-slate-100 pt-6">
              {step > 0 ? <Button type="button" variant="ghost" onClick={() => setStep((current) => current - 1)}><ArrowLeft size={16} /> Back</Button> : <span />}
              {step < 2 ? <Button type="button" onClick={next}>Continue <ArrowRight size={16} /></Button> : <Button type="submit" loading={submitting} loadingText="Submitting securely..."><ShieldCheck size={16} /> Submit securely</Button>}
            </div>
          </form>
        </Card>
      </main>
    </>
  );
}

function StepTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return <div className="mb-7"><h2 className="serif text-2xl font-bold text-navy">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p></div>;
}
