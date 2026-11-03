import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { getOrSetCache } from "@/lib/redis";
import { ADMIN_CASE_QUEUE_CACHE_KEY } from "@/lib/cache-keys";
import CaseQueue from "./case-queue";

export const dynamic = "force-dynamic";

export default async function Cases() {
  const cases = await getOrSetCache(ADMIN_CASE_QUEUE_CACHE_KEY, () => prisma.debtCase.findMany({
    orderBy: { createdAt: "desc" },
    include: { evidenceFiles: { select: { id: true } }, payment: { select: { status: true } } },
  }), 300);
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
      <CaseQueue cases={cases.map((item) => ({ ...item, createdAt: new Date(item.createdAt).toISOString(), evidenceCount: item.evidenceFiles.length }))} />
    </>
  );
}

function Stat({ label, value, detail, red }: { label: string; value: string; detail: string; red?: boolean }) {
  return <Card className="p-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p><div className="mt-2 flex items-end justify-between gap-3"><b className={`text-3xl ${red ? "text-red-600" : "text-navy"}`}>{value}</b><span className="text-right text-xs font-semibold text-slate-500">{detail}</span></div></Card>;
}
