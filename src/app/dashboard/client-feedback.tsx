"use client";

import { FormEvent, useState } from "react";
import { Check, Star } from "lucide-react";
import { Button, Card, Field } from "@/components/ui";

type ExistingFeedback = { rating: number; message: string; approved: boolean };

export default function ClientFeedback({ existing }: { existing: ExistingFeedback[] }) {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus("");
    setError("");
    const form = event.currentTarget;
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
      });
      const result = await response.json() as { message?: string; error?: string };
      if (!response.ok) throw new Error(result.error ?? "Unable to submit feedback.");
      setStatus(result.message ?? "Thank you for your feedback.");
      form.reset();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  }

  return <Card className="mt-8 p-6 sm:p-8">
    <h2 className="serif text-2xl font-bold text-navy">Share your experience</h2>
    <p className="mt-2 text-sm text-slate-500">Your feedback is reviewed before it appears publicly.</p>
    {existing.length > 0 && <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600"><p className="font-bold text-navy">Your previous feedback</p>{existing.slice(0, 3).map((item, index) => <div key={`${item.message}-${index}`} className="mt-3 border-t border-slate-200 pt-3"><div className="flex items-center gap-1 text-[#b18a20]">{Array.from({ length: 5 }, (_, star) => <Star key={star} size={14} fill={star < item.rating ? "currentColor" : "none"} />)}</div><p className="mt-1">{item.message}</p><p className="mt-1 text-xs font-semibold">{item.approved ? "Published" : "Awaiting admin review"}</p></div>)}</div>}
    <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2">
      <Field label="City" name="city" required />
      <label className="grid gap-1.5 text-sm font-semibold text-slate-700">Rating<select name="rating" defaultValue="5" className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 font-normal"><option value="5">5 stars</option><option value="4">4 stars</option><option value="3">3 stars</option><option value="2">2 stars</option><option value="1">1 star</option></select></label>
      <label className="grid gap-1.5 text-sm font-semibold text-slate-700 sm:col-span-2">Feedback<textarea name="message" required minLength={10} maxLength={1000} rows={4} className="rounded-xl border border-slate-200 px-3.5 py-3 font-normal outline-none focus:border-gold" /></label>
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700 sm:col-span-2">{error}</p>}
      {status && <p className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700 sm:col-span-2"><Check size={16} />{status}</p>}
      <Button type="submit" loading={submitting} loadingText="Submitting...">Submit feedback</Button>
    </form>
  </Card>;
}
