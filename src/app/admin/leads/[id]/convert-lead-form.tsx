"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { convertLeadToCase } from "@/app/actions/case-actions";
import { Button, Card } from "@/components/ui";

export default function ConvertLeadForm({ leadId }: { leadId: string }) {
  const [result, setResult] = useState<{ caseNumber: string; clientEmail: string; temporaryPassword: string }>();
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    try { setResult(await convertLeadToCase({ leadId, ...Object.fromEntries(new FormData(event.currentTarget).entries()) })); } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not create case"); }
  }
  if (result) return <Card className="border-emerald-200 bg-emerald-50 p-6"><h2 className="font-bold text-emerald-900">Client registration completed</h2><p className="mt-4 text-sm text-emerald-800">Share these credentials securely with the client. Add case and payment details from the next page.</p><div className="mt-4 space-y-2 rounded-xl bg-white p-4 text-sm"><p>Case ID: <b className="font-mono">{result.caseNumber}</b></p><p>Login email: <b>{result.clientEmail}</b></p><p>Temporary password: <b className="font-mono">{result.temporaryPassword}</b></p></div><Link href={`/admin/cases/${result.caseNumber}`} className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-navy px-4 py-3 text-sm font-semibold text-white">Continue to case details</Link></Card>;
  return <Card className="p-6"><h2 className="text-xl font-bold text-navy">Register client</h2><p className="mt-2 text-sm leading-6 text-slate-500">Generate the client login and case ID first. Bank, fee, installment and other case details can be added on the next page.</p><form onSubmit={submit} className="mt-5 grid gap-4">{error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<Button type="submit">Generate case ID and client login</Button></form></Card>;
}
