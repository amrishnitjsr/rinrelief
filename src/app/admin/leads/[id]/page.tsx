import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ConvertLeadForm from "./convert-lead-form";

export default async function LeadDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await prisma.lead.findUnique({ where: { id }, include: { convertedCase: true, assignedTo: { select: { name: true } } } });
  if (!lead) notFound();
  return <><Link href="/admin/leads" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500"><ArrowLeft size={16} /> Back to leads</Link><div className="mt-6"><p className="text-sm font-bold uppercase tracking-widest text-[#9b7b18]">Lead {lead.referenceNo}</p><h1 className="serif mt-2 text-4xl font-bold text-navy">{lead.name}</h1><p className="mt-2 text-sm text-slate-500">{lead.email} · {lead.phone} · {lead.city}</p></div><div className="mt-8 grid gap-6 lg:grid-cols-[.8fr_1.2fr]"><div className="rounded-2xl border border-slate-200 bg-white p-6"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Inquiry</p><p className="mt-3 text-sm leading-7 text-slate-700">{lead.issueSummary}</p><p className="mt-5 text-sm text-slate-500">Category: <b className="text-navy">{lead.category.replaceAll("_", " ")}</b></p></div>{lead.convertedCase ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6"><p className="font-bold text-emerald-800">Case already created</p><Link className="mt-3 inline-block font-mono font-bold text-emerald-900 underline" href={`/admin/cases/${lead.convertedCase.caseNumber ?? lead.convertedCase.id}`}>{lead.convertedCase.caseNumber}</Link></div> : <ConvertLeadForm leadId={lead.id} />}</div></>;
}
