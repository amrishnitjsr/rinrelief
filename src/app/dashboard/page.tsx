import Link from "next/link";
import { redirect } from "next/navigation";
import { Check, Clock3, FileText, ShieldCheck, Sparkles, UploadCloud } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Button, Card } from "@/components/ui";
import { SiteHeader } from "@/components/site-header";
import ClientSupport from "./client-support";
import ClientFeedback from "./client-feedback";

const stages = [
  ["INQUIRY_RECEIVED", "Inquiry received"],
  ["CONSULTATION_PAID", "Consultation confirmed"],
  ["LEGAL_NOTICE_SENT", "Notice sent"],
  ["UNDER_NEGOTIATION", "Under bank negotiation"],
  ["SETTLEMENT_REACHED", "Settlement letter received"],
  ["CLOSED", "Case closed"],
] as const;

const statusLabels: Record<string, string> = {
  INQUIRY_RECEIVED: "Inquiry received",
  CONSULTATION_PAID: "Consultation confirmed",
  LEGAL_NOTICE_SENT: "Notice sent",
  UNDER_NEGOTIATION: "Under bank negotiation",
  SETTLEMENT_REACHED: "Settlement letter received",
  CLOSED: "Case closed",
};

function formatStoredDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", { timeZone: "UTC" }).format(value);
}

export default async function ClientDashboard() {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "CLIENT") redirect("/login");

  const cases = await prisma.debtCase.findMany({
    where: {
      OR: [
        { clientEmail: session.user.email.toLowerCase() },
        ...(session.user.phone ? [{ clientPhone: session.user.phone }] : []),
      ],
    },
    orderBy: { updatedAt: "desc" },
    include: {
      evidenceFiles: { where: { isClientVisible: true }, select: { id: true, fileName: true, referenceNo: true } },
      notes: { where: { isInternalOnly: false }, orderBy: { createdAt: "desc" } },
      payment: { select: { status: true } },
      invoices: { include: { installments: { orderBy: { dueDate: "asc" } } }, orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  const queries = await prisma.clientQuery.findMany({
      where: { clientId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, subject: true, message: true, status: true, createdAt: true },
  });
  const feedback = await prisma.feedback.findMany({
    where: { clientId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { rating: true, message: true, approved: true },
  });
  const activeCases = cases.filter((item) => item.status !== "CLOSED").length;
  const openInstallments = cases.reduce((total, item) => total + (item.invoices[0]?.installments.filter((installment) => installment.status !== "PAID").length ?? 0), 0);

  return (
    <>
    <SiteHeader />
    <main className="mx-auto max-w-6xl px-5 pb-12 pt-32 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[.16em] text-[#9b7b18]">Borrower dashboard</p>
          <h1 className="serif mt-2 text-4xl font-bold text-navy">Your legal case timeline</h1>
          <p className="mt-2 text-sm text-slate-500">Private updates for {session.user.name ?? session.user.email}.</p>
        </div>
        <Link href="/case-intake"><Button>Open another case</Button></Link>
      </div>

      {cases.length === 0 ? (
        <Card className="mt-8 p-10 text-center">
          <ShieldCheck className="mx-auto text-[#b18d20]" size={34} />
          <h2 className="serif mt-4 text-2xl font-bold text-navy">No cases yet</h2>
          <p className="mt-2 text-sm text-slate-500">Start a confidential intake to see your case status here.</p>
          <Link href="/case-intake"><Button className="mt-6">Start confidential intake</Button></Link>
        </Card>
      ) : (
        <div className="mt-8 space-y-6">
          {cases.map((item) => {
            const currentIndex = stages.findIndex(([status]) => status === item.status);
            return (
              <Card key={item.id} className="p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-bold text-navy">{item.bankOrLenderName}</h2>
                      <Badge tone={item.status === "CLOSED" ? "slate" : item.facingHarassment ? "red" : "blue"}>{item.status === "CLOSED" ? "Case closed" : item.facingHarassment ? "Priority support" : "Active case"}</Badge>
                    </div>
                    <p className="mt-1 font-mono text-xs text-slate-400">Case {item.caseNumber ?? item.id}</p>
                  </div>
                  <div className="flex flex-col items-end gap-3 text-right">
                    <p className="text-xs uppercase tracking-wider text-slate-500">Current stage</p>
                    <p className="mt-1 font-bold text-navy">{statusLabels[item.status] ?? item.status}</p>
                  </div>
                </div>
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <Summary icon={<FileText size={16} />} label="Evidence files" value={String(item.evidenceFiles.length)} />
                  <Summary icon={<Clock3 size={16} />} label="Last updated" value={item.updatedAt.toLocaleDateString("en-IN")} />
                  <Summary icon={<ShieldCheck size={16} />} label="Consultation" value={item.payment?.status === "CAPTURED" ? "Paid" : "Pending"} />
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <Summary icon={<ShieldCheck size={16} />} label="Agreed fee" value={`₹${(item.invoices[0]?.totalFee ?? item.feeAmount).toLocaleString("en-IN")}`} />
                  <Summary icon={<Clock3 size={16} />} label="Paid to date" value={`₹${(item.invoices[0]?.totalPaid ?? 0).toLocaleString("en-IN")}`} />
                  <Summary icon={<FileText size={16} />} label="Outstanding" value={`₹${Math.max(0, (item.invoices[0]?.totalFee ?? item.feeAmount) - (item.invoices[0]?.totalPaid ?? 0) + (item.invoices[0]?.penaltyAmount ?? 0)).toLocaleString("en-IN")}`} />
                </div>
                {(item.invoices[0]?.installments.length || item.notes.length || item.evidenceFiles.length) ? <div className="mt-6 grid gap-5 lg:grid-cols-3">
                  <div><h3 className="text-sm font-bold text-navy">Installment plan</h3><div className="mt-3 space-y-2">{item.invoices[0]?.installments.map((installment) => <div key={installment.id} className="rounded-xl bg-slate-50 p-3 text-sm"><div className="flex justify-between"><b>₹{installment.amount.toLocaleString("en-IN")} <span className="text-xs font-normal text-slate-500">({installment.percentage}%)</span></b><Badge tone={installment.status === "PAID" ? "green" : installment.status === "OVERDUE" ? "red" : "amber"}>{installment.status}</Badge></div><p className="mt-1 text-xs text-slate-500">Due {formatStoredDate(installment.dueDate)}</p></div>)}</div></div>
                  <div><h3 className="text-sm font-bold text-navy">Case updates</h3><div className="mt-3 space-y-2">{item.notes.slice(0, 4).map((note) => <div key={note.id} className="rounded-xl border border-slate-200 p-3 text-sm"><p className="text-xs text-slate-400">{note.createdAt.toLocaleDateString("en-IN")}</p><p className="mt-1 text-slate-700">{note.content}</p></div>)}</div></div>
                  <div><h3 className="text-sm font-bold text-navy">Case files</h3><div className="mt-3 space-y-2">{item.evidenceFiles.map((file) => <a key={file.id} href={`/api/documents/${file.id}/download`} className="block rounded-xl border border-slate-200 p-3 text-sm font-semibold text-navy hover:border-gold">{file.referenceNo ? `${file.referenceNo} · ` : ""}{file.fileName}</a>)}</div></div>
                </div> : null}
                <div className="mt-8 grid gap-4 md:grid-cols-5">
                  {stages.map(([status, label], index) => (
                    <div key={status} className="relative">
                      {index < stages.length - 1 && <span className={`absolute left-7 top-3 hidden h-0.5 w-[calc(100%-1.25rem)] md:block ${index < currentIndex ? "bg-emerald-500" : "bg-slate-200"}`} />}
                      <div className="relative flex items-start gap-3 md:block">
                        <div className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${index <= currentIndex ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"}`}>{index < currentIndex ? <Check size={14} /> : index + 1}</div>
                        <p className={`mt-1 text-sm font-semibold md:mt-3 ${index <= currentIndex ? "text-navy" : "text-slate-400"}`}>{label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Summary icon={<Sparkles size={16} />} label="Active cases" value={String(activeCases)} />
        <Summary icon={<UploadCloud size={16} />} label="Visible documents" value={String(cases.reduce((total, item) => total + item.evidenceFiles.length, 0))} />
        <Summary icon={<Clock3 size={16} />} label="Upcoming installments" value={String(openInstallments)} />
      </div>
      <ClientSupport queries={queries.map((query) => ({ ...query, createdAt: query.createdAt.toISOString() }))} />
      <ClientFeedback existing={feedback} />
    </main>
    </>
  );
}

function Summary({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"><span className="text-[#9b7b18]">{icon}</span><div><p className="text-xs text-slate-500">{label}</p><p className="mt-0.5 text-sm font-bold text-navy">{value}</p></div></div>;
}
