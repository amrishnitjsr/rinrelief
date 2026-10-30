"use client";

import { FormEvent, useState } from "react";
import { convertLeadToCase } from "@/app/actions/case-actions";
import { Button, Card, Field } from "@/components/ui";

export default function ConvertLeadForm({ leadId }: { leadId: string }) {
  const [result, setResult] = useState<{ caseNumber: string; clientEmail: string; temporaryPassword: string }>();
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    try { setResult(await convertLeadToCase({ leadId, ...Object.fromEntries(new FormData(event.currentTarget).entries()) })); } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not create case"); }
  }
  if (result) return <Card className="border-emerald-200 bg-emerald-50 p-6"><h2 className="font-bold text-emerald-900">Case created successfully</h2><p className="mt-4 text-sm text-emerald-800">Share these credentials securely with the client.</p><div className="mt-4 space-y-2 rounded-xl bg-white p-4 text-sm"><p>Case ID: <b className="font-mono">{result.caseNumber}</b></p><p>Login email: <b>{result.clientEmail}</b></p><p>Temporary password: <b className="font-mono">{result.temporaryPassword}</b></p></div></Card>;
  return <Card className="p-6"><h2 className="text-xl font-bold text-navy">Create case after consultation</h2><form onSubmit={submit} className="mt-5 grid gap-4"><Field label="Bank / lender" name="bankOrLenderName" required /><label className="grid gap-1.5 text-sm font-semibold text-slate-700">Loan type<select name="loanType" className="rounded-xl border border-slate-200 px-3 py-3 font-normal"><option value="PERSONAL_LOAN">Personal loan</option><option value="CREDIT_CARD">Credit card</option><option value="APP_LOAN_INSTANT">App loan</option><option value="BUSINESS_LOAN">Business loan</option><option value="HOME_OR_AUTO_LOAN">Home / auto loan</option></select></label><Field label="Total loan outstanding" name="totalOutstanding" type="number" min="0" required /><Field label="Agreed legal fee" name="feeAmount" type="number" min="0" required /><Field label="First installment amount (optional)" name="installmentAmount" type="number" min="0" /><Field label="First installment due date (optional)" name="installmentDueDate" type="date" />{error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<Button type="submit">Generate case ID and client login</Button></form></Card>;
}
