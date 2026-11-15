"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Check, MessageCircle, X } from "lucide-react";
import { Button, Card, Field } from "@/components/ui";
import { formatLeadWhatsAppMessage, openAdminWhatsApp } from "@/lib/whatsapp";

const categories = [
  ["DEBT_SETTLEMENT", "Debt settlement"],
  ["BANKING", "Banking"],
  ["CIVIL_DISPUTE", "Civil dispute"],
  ["CONSUMER", "Consumer"],
  ["FAMILY", "Family matter"],
  ["CRIMINAL", "Criminal matter"],
  ["PROPERTY", "Property"],
  ["EMPLOYMENT", "Employment"],
  ["BUSINESS", "Business"],
  ["CYBERCRIME", "Cybercrime"],
  ["OTHER", "Other legal matter"],
] as const;

export function LeadChatbot() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState<string>();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form.entries())),
      });
      const result = (await response.json()) as { id?: string; referenceNo?: string; error?: string };
      if (!response.ok || !result.id || !result.referenceNo) {
        setError(result.error ?? "We could not submit your inquiry.");
        return;
      }
      openAdminWhatsApp(formatLeadWhatsAppMessage({
        id: result.id,
        referenceNo: result.referenceNo,
        name: String(form.get("name") ?? ""),
        phone: String(form.get("phone") ?? ""),
        category: String(form.get("category") ?? ""),
        issueSummary: String(form.get("issueSummary") ?? ""),
      }));
      setSubmitted(result.referenceNo);
    } catch {
      setError("We could not submit your inquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="fixed bottom-5 left-4 right-20 z-40 inline-flex justify-center gap-2 rounded-full bg-espresso px-4 py-3 text-sm font-bold text-white shadow-xl transition-transform duration-100 active:scale-95 hover:bg-[#4a3d33] sm:left-auto sm:right-24 sm:px-5" aria-label="Open legal inquiry chat">
        <MessageCircle size={18} /> Talk to a case manager
      </button>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-espresso/30 p-4 sm:place-items-center">
          <Card className="w-full max-w-lg overflow-hidden">
            <div className="flex items-start justify-between bg-espresso p-6 text-white">
              <div><p className="text-xs font-bold uppercase tracking-widest text-gold">Private inquiry</p><h2 className="serif mt-2 text-3xl font-bold">Tell us what happened.</h2><p className="mt-2 text-sm text-white/65">A case manager will review your details and contact you.</p></div>
              <button onClick={() => setOpen(false)} aria-label="Close inquiry form" className="rounded-full p-2 text-white/70 hover:bg-white/10"><X size={20} /></button>
            </div>
            {submitted ? (
              <div className="p-8 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-700"><Check /></div><h3 className="serif mt-5 text-2xl font-bold text-navy">Inquiry received</h3><p className="mt-2 text-sm text-slate-600">Keep this reference for follow-up:</p><p className="mt-3 rounded-xl bg-slate-50 p-3 font-mono text-sm font-bold text-navy">{submitted}</p><Button className="mt-6" onClick={() => setOpen(false)}>Done</Button></div>
            ) : (
              <form onSubmit={submit} className="grid gap-4 p-6">
                <div className="grid gap-4 sm:grid-cols-2"><Field label="Full name" name="name" required /><Field label="Phone number" name="phone" required /><Field label="Email" name="email" type="email" required /><Field label="City" name="city" required /></div>
                <label className="grid gap-1.5 text-sm font-semibold text-slate-700">Legal category<select name="category" required className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 font-normal outline-none focus:border-gold"><option value="">Select a category</option>{categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                <label className="grid gap-1.5 text-sm font-semibold text-slate-700">Brief issue description<textarea name="issueSummary" required minLength={10} rows={3} className="rounded-xl border border-slate-200 px-3.5 py-3 font-normal outline-none focus:border-gold" /></label>
                {error && <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
                <Button type="submit" loading={submitting} loadingText="Submitting inquiry...">Submit inquiry <ArrowRight size={16} /></Button>
              </form>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
