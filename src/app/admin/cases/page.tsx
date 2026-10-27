import Link from "next/link";
import { Filter, Search, SlidersHorizontal } from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";
import { prisma } from "@/lib/prisma";

const statusTone: Record<string, string> = {
  INQUIRY_RECEIVED: "blue",
  CONSULTATION_PAID: "gold",
  LEGAL_NOTICE_SENT: "blue",
  UNDER_NEGOTIATION: "amber",
  SETTLEMENT_REACHED: "green",
  CLOSED: "slate",
};

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

export default async function Cases() {
  const cases = await prisma.debtCase.findMany({
    orderBy: { createdAt: "desc" },
    include: { evidenceFiles: { select: { id: true } }, payment: { select: { status: true } } },
  });
  const activeCases = cases.filter((item) => !["CLOSED", "SETTLEMENT_REACHED"].includes(item.status));
  const priorityCases = cases.filter((item) => item.facingHarassment || item.receivedLegalNotice);
  const settlementValue = activeCases.reduce((total, item) => total + (item.settlementBudget ?? 0), 0);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm font-bold uppercase tracking-widest text-[#9b7b18]">Advocate console</p><h1 className="serif mt-1 text-4xl font-bold text-navy">Case queue</h1><p className="mt-2 text-sm text-slate-500">Live borrower inquiries, triage, and settlement progress.</p></div>
        <Button><SlidersHorizontal size={16} /> Manage views</Button>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="All active cases" value={String(activeCases.length)} detail={`${cases.length} total`} />
        <Stat label="Needs triage" value={String(priorityCases.length)} detail="Harassment or notice" red={priorityCases.length > 0} />
        <Stat label="Settlement value" value={`₹${settlementValue.toLocaleString("en-IN")}`} detail="Active budgets" />
      </div>
      <Card className="mt-7 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4">
          <div className="flex min-w-52 flex-1 items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-400"><Search size={16} /><input className="w-full bg-transparent outline-none" placeholder="Search case, borrower or lender" aria-label="Search case, borrower or lender" /></div>
          <Button variant="outline" className="text-xs"><Filter size={14} /> All lenders</Button>
          <Button variant="outline" className="text-xs">Priority: All</Button>
        </div>
        {cases.length === 0 ? <div className="p-12 text-center text-sm text-slate-500">No borrower inquiries have been submitted yet.</div> : <div className="overflow-x-auto"><table className="w-full min-w-[960px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3">Case</th><th className="px-5 py-3">Borrower</th><th className="px-5 py-3">Lender / loan</th><th className="px-5 py-3">Outstanding</th><th className="px-5 py-3">Risk</th><th className="px-5 py-3">Evidence</th><th className="px-5 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{cases.map((item) => <tr key={item.id} className="transition hover:bg-slate-50"><td className="px-5 py-4"><Link href={`/admin/cases/${item.caseNumber ?? item.id}`} className="font-bold text-navy hover:underline">{item.caseNumber ?? "Pending number"}</Link><p className="mt-1 text-xs text-slate-400">{item.createdAt.toLocaleString("en-IN")}</p></td><td className="px-5 py-4"><p className="font-semibold">{item.clientName}</p><p className="mt-1 text-xs text-slate-400">{item.city} · {item.clientPhone}</p></td><td className="px-5 py-4"><span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold">{item.bankOrLenderName}</span><p className="mt-2 text-xs text-slate-500">{formatStatus(item.loanType)}</p></td><td className="px-5 py-4 font-semibold">₹{item.totalOutstanding.toLocaleString("en-IN")}<p className="mt-1 text-xs font-normal text-slate-400">{item.overdueDurationDays} days overdue</p></td><td className="px-5 py-4">{item.facingHarassment || item.receivedLegalNotice ? <Badge tone="red">{item.receivedLegalNotice ? "LEGAL NOTICE" : "HARASSMENT"}</Badge> : <span className="text-slate-300">Standard</span>}</td><td className="px-5 py-4 text-center font-semibold">{item.evidenceFiles.length}</td><td className="px-5 py-4"><Badge tone={statusTone[item.status] ?? "slate"}>{formatStatus(item.status)}</Badge></td></tr>)}</tbody></table></div>}
      </Card>
    </>
  );
}

function Stat({ label, value, detail, red }: { label: string; value: string; detail: string; red?: boolean }) {
  return <Card className="p-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p><div className="mt-2 flex items-end justify-between gap-3"><b className={`text-3xl ${red ? "text-red-600" : "text-navy"}`}>{value}</b><span className="text-right text-xs font-semibold text-slate-500">{detail}</span></div></Card>;
}
