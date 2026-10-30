import { Phone, Search } from "lucide-react";
import { Badge, Card } from "@/components/ui";
import { prisma } from "@/lib/prisma";

const statusTone: Record<string, string> = { NEW: "blue", CONTACTED: "amber", QUALIFIED: "gold", CONVERTED: "green", CLOSED: "slate" };

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: { assignedTo: { select: { name: true } } },
  });
  return (
    <>
      <div><p className="text-sm font-bold uppercase tracking-widest text-[#9b7b18]">Intake desk</p><h1 className="serif mt-1 text-4xl font-bold text-navy">Lead queue</h1><p className="mt-2 text-sm text-slate-500">New website inquiries ready for case-manager follow-up.</p></div>
      <Card className="mt-8 overflow-hidden">
        <div className="flex items-center gap-2 border-b border-slate-200 bg-white p-4 text-sm text-slate-500"><Search size={16} /> {leads.length} inquiries captured</div>
        {leads.length === 0 ? <p className="p-12 text-center text-sm text-slate-500">No website inquiries yet.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr>{["Reference", "Lead", "Category", "Issue", "Owner", "Status", "Received"].map((heading) => <th key={heading} className="px-5 py-3">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{leads.map((lead) => <tr key={lead.id} className="hover:bg-slate-50"><td className="px-5 py-4 font-mono text-xs font-bold text-navy"><a href={`/admin/leads/${lead.id}`} className="hover:underline">{lead.referenceNo}</a></td><td className="px-5 py-4"><p className="font-semibold text-navy">{lead.name}</p><p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Phone size={12} /> {lead.phone}</p><p className="text-xs text-slate-400">{lead.email} · {lead.city}</p></td><td className="px-5 py-4 font-semibold">{lead.category.replaceAll("_", " ")}</td><td className="max-w-xs px-5 py-4 text-slate-600">{lead.issueSummary}</td><td className="px-5 py-4 text-slate-600">{lead.assignedTo?.name ?? "Unassigned"}</td><td className="px-5 py-4"><Badge tone={statusTone[lead.status] ?? "slate"}>{lead.status}</Badge></td><td className="px-5 py-4 text-xs text-slate-500">{lead.createdAt.toLocaleString("en-IN")}</td></tr>)}</tbody></table></div>}
      </Card>
    </>
  );
}
