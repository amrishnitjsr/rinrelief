"use client";

import { FormEvent, useState } from "react";
import { updateCaseOperations } from "@/app/actions/case-actions";
import { Button, Card, Field } from "@/components/ui";

export default function CaseOperations({ caseId, status, feeAmount, totalPaid }: { caseId: string; status: string; feeAmount: number; totalPaid: number }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setMessage("");
    try { await updateCaseOperations({ caseId, ...Object.fromEntries(new FormData(event.currentTarget).entries()) }); setMessage("Client portal updated successfully."); } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not update case"); }
  }
  return <Card className="p-5"><h2 className="font-bold text-navy">Update client portal</h2><form onSubmit={submit} className="mt-4 grid gap-3"><label className="grid gap-1.5 text-sm font-semibold text-slate-700">Case status<select name="status" defaultValue={status} className="rounded-xl border border-slate-200 px-3 py-3 font-normal">{["INQUIRY_RECEIVED", "CONSULTATION_PAID", "LEGAL_NOTICE_SENT", "UNDER_NEGOTIATION", "SETTLEMENT_REACHED", "CLOSED"].map((item) => <option key={item} value={item}>{item.replaceAll("_", " ")}</option>)}</select></label><Field label="Agreed fee" name="feeAmount" type="number" min="0" defaultValue={feeAmount} required /><Field label="Total paid" name="totalPaid" type="number" min="0" defaultValue={totalPaid} required /><label className="grid gap-1.5 text-sm font-semibold text-slate-700">Client-visible update<textarea name="clientUpdate" rows={4} placeholder="Complaint response, filing update, hearing date..." className="rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none focus:border-gold" /></label>{error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}{message && <p className="rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{message}</p>}<Button type="submit">Save and publish update</Button></form></Card>;
}
