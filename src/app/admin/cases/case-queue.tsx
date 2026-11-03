"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Filter, Search } from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";

type CaseRow = {
  id: string;
  caseNumber: string | null;
  createdAt: string;
  clientName: string;
  city: string;
  clientPhone: string;
  bankOrLenderName: string;
  loanType: string;
  totalOutstanding: number;
  overdueDurationDays: number;
  facingHarassment: boolean;
  receivedLegalNotice: boolean;
  evidenceCount: number;
  status: string;
};

const statusTone: Record<string, string> = {
  INQUIRY_RECEIVED: "blue",
  CONSULTATION_PAID: "gold",
  LEGAL_NOTICE_SENT: "blue",
  UNDER_NEGOTIATION: "amber",
  SETTLEMENT_REACHED: "green",
  CLOSED: "slate",
};

export default function CaseQueue({ cases }: { cases: CaseRow[] }) {
  const [query, setQuery] = useState("");
  const [lender, setLender] = useState("ALL");
  const [priority, setPriority] = useState("ALL");
  const [searching, setSearching] = useState(false);
  const [openingCase, setOpeningCase] = useState<string | null>(null);
  const lenders = useMemo(() => [...new Set(cases.map((item) => item.bankOrLenderName))], [cases]);

  useEffect(() => {
    if (!query.trim()) {
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = window.setTimeout(() => setSearching(false), 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  const filteredCases = cases.filter((item) => {
    const text = `${item.caseNumber ?? ""} ${item.clientName} ${item.clientPhone} ${item.bankOrLenderName}`.toLowerCase();
    const matchesQuery = text.includes(query.trim().toLowerCase());
    const matchesLender = lender === "ALL" || item.bankOrLenderName === lender;
    const isPriority = item.facingHarassment || item.receivedLegalNotice;
    return matchesQuery && matchesLender && (priority === "ALL" || (priority === "HIGH" && isPriority) || (priority === "STANDARD" && !isPriority));
  });

  return (
    <Card className="relative mt-7 overflow-hidden">
      {openingCase && <div role="status" className="absolute inset-x-0 top-0 z-10 flex items-center justify-center gap-2 bg-navy px-4 py-2 text-xs font-semibold text-white"><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" /> Opening case...</div>}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4">
        <div className="flex min-w-52 flex-1 items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-400">
          {searching ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" /> : <Search size={16} />}
          <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent outline-none" placeholder="Search case, borrower or lender" aria-label="Search case, borrower or lender" />
          {searching && <span className="whitespace-nowrap text-xs">Searching...</span>}
        </div>
        <label className="sr-only" htmlFor="case-lender-filter">Filter by lender</label>
        <select id="case-lender-filter" value={lender} onChange={(event) => setLender(event.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-navy">
          <option value="ALL">All lenders</option>
          {lenders.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <label className="sr-only" htmlFor="case-priority-filter">Filter by priority</label>
        <select id="case-priority-filter" value={priority} onChange={(event) => setPriority(event.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-navy">
          <option value="ALL">Priority: All</option>
          <option value="HIGH">Priority: High</option>
          <option value="STANDARD">Priority: Standard</option>
        </select>
      </div>
      {filteredCases.length === 0 ? <div className="p-12 text-center text-sm text-slate-500">{cases.length === 0 ? "No borrower inquiries have been submitted yet." : "No cases match these filters."}</div> : <div className="overflow-x-auto"><table className="w-full min-w-[960px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3">Case</th><th className="px-5 py-3">Borrower</th><th className="px-5 py-3">Lender / loan</th><th className="px-5 py-3">Outstanding</th><th className="px-5 py-3">Risk</th><th className="px-5 py-3">Evidence</th><th className="px-5 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredCases.map((item) => <tr key={item.id} className={`transition hover:bg-slate-50 ${openingCase === item.id ? "bg-blue-50" : ""}`}><td className="px-5 py-4"><Link href={`/admin/cases/${item.caseNumber ?? item.id}`} onClick={() => setOpeningCase(item.id)} aria-busy={openingCase === item.id} className="inline-flex items-center gap-2 font-bold text-navy hover:underline">{openingCase === item.id && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-navy border-t-transparent" />}{item.caseNumber ?? "Pending number"}</Link><p className="mt-1 text-xs text-slate-400">{new Date(item.createdAt).toLocaleString("en-IN")}</p></td><td className="px-5 py-4"><p className="font-semibold">{item.clientName}</p><p className="mt-1 text-xs text-slate-400">{item.city} · {item.clientPhone}</p></td><td className="px-5 py-4"><span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold">{item.bankOrLenderName}</span><p className="mt-2 text-xs text-slate-500">{item.loanType.replaceAll("_", " ")}</p></td><td className="px-5 py-4 font-semibold">₹{item.totalOutstanding.toLocaleString("en-IN")}<p className="mt-1 text-xs font-normal text-slate-400">{item.overdueDurationDays} days overdue</p></td><td className="px-5 py-4">{item.facingHarassment || item.receivedLegalNotice ? <Badge tone="red">{item.receivedLegalNotice ? "LEGAL NOTICE" : "HARASSMENT"}</Badge> : <span className="text-slate-300">Standard</span>}</td><td className="px-5 py-4 text-center font-semibold">{item.evidenceCount}</td><td className="px-5 py-4"><Badge tone={statusTone[item.status] ?? "slate"}>{item.status.replaceAll("_", " ")}</Badge></td></tr>)}</tbody></table></div>}
    </Card>
  );
}
