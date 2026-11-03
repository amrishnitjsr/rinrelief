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

type FormData = {
  lender: string;
  loanType: "Personal Loan" | "Credit Card" | "Instant App Loan" | "Business Loan";
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

const steps = ["Loan profile", "Harassment screener", "Evidence locker", "Your consultation"];
const loanTypeMap: Record<FormData["loanType"], string> = {
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
  const { register, handleSubmit, trigger, getValues } = useForm<FormData>({
    defaultValues: { loanType: "Personal Loan", harassment: "yes", notice: "no", violations: [] },
  });

  const next = async () => {
    const fields: Record<number, (keyof FormData)[]> = {
      0: ["lender", "loanType", "amount", "months", "principal"],
      1: ["harassment", "violations", "notice"],
      2: [],
    };
    if (!(await trigger(fields[step]))) return;
    setStep((current) => Math.min(3, current + 1));
  };

  const submitCase = async (data: FormData) => {
    setError("");
    const response = await fetch("/api/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName: data.name,
        clientEmail: data.email,
        clientPhone: data.mobile,
        city: data.city,
        bankOrLenderName: data.lender,
        loanType: loanTypeMap[data.loanType],
        totalOutstanding: Number(data.amount),
        principalAmount: data.principal ? Number(data.principal) : undefined,
        overdueDurationDays: Number(data.months) * 30,
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
    setCaseDetails({ id: result.id, caseNumber: result.caseNumber });
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
          <h1 className="serif mt-3 text-4xl font-bold text-navy sm:text-5xl">Let’s replace panic with a plan.</h1>
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
                  <StepTitle title="Tell us about the loan" subtitle="We use this to understand the lender’s recovery process." />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="grid gap-1.5 text-sm font-semibold text-slate-700 sm:col-span-2">
                      Lender / bank
                      <select className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 font-normal" {...register("lender", { required: true })}>
                        <option value="">Select your lender</option>
                        {["HDFC Bank", "State Bank of India", "Bajaj Finance", "KreditBee", "ICICI Bank", "Axis Bank", "MoneyView", "Other lender"].map((name) => <option key={name}>{name}</option>)}
                      </select>
                    </label>
                    <div className="sm:col-span-2">
                      <p className="mb-2 text-sm font-semibold text-slate-700">Loan type</p>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {(["Personal Loan", "Credit Card", "Instant App Loan", "Business Loan"] as FormData["loanType"][]).map((type) => (
                          <label key={type} className="cursor-pointer">
                            <input type="radio" className="peer sr-only" value={type} {...register("loanType")} />
                            <span className="block rounded-xl border border-slate-200 p-3 text-center text-xs font-semibold peer-checked:border-gold peer-checked:bg-[#fdf9ed]">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <Field label="Total outstanding (₹)" type="number" min="1" placeholder="e.g. 350000" {...register("amount", { required: true })} />
                    <Field label="Principal amount (₹)" type="number" min="1" placeholder="Optional" {...register("principal")} />
                    <Field label="How long overdue? (months)" type="number" min="0" {...register("months", { required: true })} />
                  </div>
                </motion.div>
              )}
              {step === 1 && (
                <motion.div key="screener" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <StepTitle title="How serious is the recovery?" subtitle="Specific details help us protect you faster." />
                  <p className="text-sm font-semibold text-slate-700">Are agents abusing, threatening, or contacting friends/family?</p>
                  <div className="mt-3 flex gap-3">{(["yes", "no"] as const).map((value) => <label key={value} className="cursor-pointer"><input type="radio" className="peer sr-only" value={value} {...register("harassment")} /><span className="block rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold capitalize peer-checked:border-gold peer-checked:bg-[#fdf9ed]">{value}</span></label>)}</div>
                  <p className="mt-7 text-sm font-semibold text-slate-700">What have you experienced? <span className="font-normal text-slate-400">(Select all)</span></p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">{["Abusive phone calls", "WhatsApp blackmail / defamation", "Unauthorized home / office visits", "Fake police / arrest threats"].map((value) => <label key={value} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm"><input type="checkbox" value={value} {...register("violations")} />{value}</label>)}</div>
                  <p className="mt-7 text-sm font-semibold text-slate-700">Have you received a legal notice or Section 138 / cheque bounce summon?</p>
                  <div className="mt-3 flex gap-3">{(["yes", "no", "not sure"] as const).map((value) => <label key={value} className="cursor-pointer"><input type="radio" className="peer sr-only" value={value} {...register("notice")} /><span className="block rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold capitalize peer-checked:border-gold peer-checked:bg-[#fdf9ed]">{value}</span></label>)}</div>
                </motion.div>
              )}
              {step === 2 && (
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
              {step === 3 && (
                <motion.div key="contact" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <StepTitle title="Where should we reach you?" subtitle="A senior case manager will call after reviewing your case details." />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Borrower name" placeholder="Full legal name" {...register("name", { required: true })} />
                    <Field label="Mobile number" placeholder="+91 98765 43210" {...register("mobile", { required: true })} />
                    <Field label="City" placeholder="e.g. Mumbai" {...register("city", { required: true })} />
                    <Field label="Email" type="email" placeholder="you@example.com" {...register("email", { required: true })} />
                  </div>
                  <Card className="mt-7 border-[#ead99a] bg-[#fffdf4] p-5 shadow-none"><div><p className="text-xs font-bold uppercase tracking-wider text-[#9b7b18]">Next step</p><h3 className="serif mt-1 text-2xl font-bold text-navy">Initial case review</h3></div><div className="mt-4 space-y-2 text-sm text-slate-600"><p className="flex items-center gap-2"><Check size={15} className="text-emerald-600" /> Case review by an advocate</p><p className="flex items-center gap-2"><Check size={15} className="text-emerald-600" /> Recovery-response plan discussion</p><p className="flex items-center gap-2"><Check size={15} className="text-emerald-600" /> Consultation and fee options explained directly</p></div></Card>
                </motion.div>
              )}
            </AnimatePresence>
            {error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">{error}</p>}
            <div className="mt-8 flex justify-between border-t border-slate-100 pt-6">
              {step > 0 ? <Button type="button" variant="ghost" onClick={() => setStep((current) => current - 1)}><ArrowLeft size={16} /> Back</Button> : <span />}
              {step < 3 ? <Button type="button" onClick={next}>Continue <ArrowRight size={16} /></Button> : <Button type="submit"><ShieldCheck size={16} /> Submit securely</Button>}
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
