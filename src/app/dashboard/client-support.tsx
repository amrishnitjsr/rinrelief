"use client";

import { FormEvent, useState } from "react";
import { MessageCircle, PhoneCall, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button, Card } from "@/components/ui";

type Query = { id: string; subject: string; message: string; status: string; createdAt: string };

export default function ClientSupport({ queries }: { queries: Query[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/client-queries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Unable to raise your query.");
      form.reset();
      setOpen(false);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to raise your query.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
      <Card className="overflow-hidden border-navy/10">
        <div className="bg-navy p-6 text-white sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-xs font-bold uppercase tracking-[.16em] text-gold">Client help desk</p><h2 className="mt-2 text-2xl font-black">Have a question? Raise it here.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-white/65">Ask about your case, documents, next steps, or payment records. Your case team will reply in the dashboard.</p></div>
            <MessageCircle className="shrink-0 text-gold" size={28} />
          </div>
          <Button className="mt-6 !bg-white !text-navy hover:!bg-slate-100" onClick={() => setOpen((value) => !value)}>{open ? "Close query form" : "Raise a query"} <Send size={15} /></Button>
        </div>
        {open && <form onSubmit={submit} className="grid gap-4 p-6 sm:p-8"><label className="grid gap-1.5 text-sm font-semibold text-slate-700">Subject<input name="subject" required minLength={3} maxLength={120} placeholder="e.g. What happens after the notice?" className="rounded-xl border border-slate-200 px-3.5 py-3 font-normal outline-none focus:border-gold" /></label><label className="grid gap-1.5 text-sm font-semibold text-slate-700">Your question<textarea name="message" required minLength={10} maxLength={2000} rows={4} placeholder="Tell us what you need help with..." className="rounded-xl border border-slate-200 px-3.5 py-3 font-normal outline-none focus:border-gold" /></label>{error && <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}<Button type="submit" loading={submitting} loadingText="Sending query...">Send query</Button></form>}
        {!open && <div className="p-6 sm:p-8"><h3 className="text-sm font-bold text-navy">Your recent queries</h3>{queries.length ? <div className="mt-4 space-y-3">{queries.slice(0, 3).map((query) => <div key={query.id} className="rounded-xl border border-slate-200 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-bold text-navy">{query.subject}</p><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${query.status === "RESOLVED" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>{query.status}</span></div><p className="mt-2 line-clamp-2 text-sm text-slate-600">{query.message}</p><p className="mt-2 text-xs text-slate-400">{new Date(query.createdAt).toLocaleDateString("en-IN")}</p></div>)}</div> : <p className="mt-2 text-sm text-slate-500">No queries yet. Our help desk is here whenever you need it.</p>}</div>}
      </Card>
      <Card className="p-6 sm:p-8"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#9b7b18]">Need a quick answer?</p><h2 className="mt-2 text-2xl font-black text-navy">Talk to the case team</h2><p className="mt-3 text-sm leading-6 text-slate-600">For urgent recovery harassment or a deadline today, contact the team directly.</p><div className="mt-6 grid gap-3"><a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700"><MessageCircle size={17} /> WhatsApp support</a><a href="tel:+919876543210" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-navy hover:border-gold"><PhoneCall size={17} /> Call support</a></div></Card>
    </div>
  );
}
