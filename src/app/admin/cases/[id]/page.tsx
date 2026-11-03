import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Download, FileAudio, FileText, Image as ImageIcon, Play, ShieldCheck } from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import CaseOperations from "./case-operations";
import DocumentUpload from "./document-upload";
import ClientCredentials from "./client-credentials";
import { getClientCredential } from "@/app/actions/case-actions";

export default async function CaseWorkspace({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await prisma.debtCase.findFirst({
    where: { OR: [{ caseNumber: id }, { id }] },
    include: {
      evidenceFiles: true,
      notes: { include: { author: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
      payment: true,
      invoices: { include: { installments: { orderBy: { dueDate: "asc" } } }, orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!item) notFound();

  const credentials = await getClientCredential(item.id);
  const invoice = item.invoices[0];
  const paidAmount = invoice?.totalPaid ?? 0;
  const totalFee = invoice?.totalFee ?? item.feeAmount;
  const outstanding = Math.max(0, totalFee - paidAmount);
  const installments = invoice?.installments.map(({ id, amount, percentage, dueDate, status }) => ({
    id, amount, percentage, dueDate: dueDate.toISOString(), status,
  })) ?? [];

  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/cases" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-navy">
          <ArrowLeft size={16} /> Back to queue
        </Link>
        <Button variant="outline" className="hidden sm:inline-flex"><Calendar size={16} /> Schedule meeting</Button>
      </div>

      <div className="mt-5 rounded-2xl bg-navy p-5 text-white shadow-soft sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="serif break-all text-2xl font-bold sm:text-3xl">{item.caseNumber ?? item.id}</h1>
              <Badge tone={item.facingHarassment || item.receivedLegalNotice ? "red" : "blue"}>
                {item.facingHarassment ? "Active harassment" : item.receivedLegalNotice ? "Legal notice" : "Standard triage"}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-white/70">{item.clientName} · {item.bankOrLenderName}</p>
            <p className="mt-1 text-xs text-white/50">Opened {item.createdAt.toLocaleString("en-IN")}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs sm:gap-4">
            <HeaderStat label="Status" value={item.status.replaceAll("_", " ")} />
            <HeaderStat label="Paid" value={`₹${paidAmount.toLocaleString("en-IN")}`} />
            <HeaderStat label="Due" value={`₹${outstanding.toLocaleString("en-IN")}`} />
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(240px,.85fr)_minmax(360px,1.2fr)]">
        <div className="space-y-5">
          <Card className="p-4 sm:p-5">
            <SectionTitle title="Borrower & debt summary" />
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                ["Borrower", item.clientName], ["Phone", item.clientPhone], ["City", item.city],
                ["Loan type", item.loanType.replaceAll("_", " ")], ["Total claimed", `₹${item.totalOutstanding.toLocaleString("en-IN")}`],
                ["Principal", item.principalAmount ? `₹${item.principalAmount.toLocaleString("en-IN")}` : "Not provided"],
                ["Days overdue", `${item.overdueDurationDays} days`], ["Settlement budget", item.settlementBudget ? `₹${item.settlementBudget.toLocaleString("en-IN")}` : "Not provided"],
              ].map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">{label}</p><b className="mt-1 block break-words text-sm text-navy">{value}</b></div>)}
            </div>
          </Card>
          <Card className="border-red-200 p-4 sm:p-5">
            <div className="flex items-center gap-2 text-red-700"><ShieldCheck size={18} /><h2 className="font-bold">Violation dossier</h2></div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{item.facingHarassment ? item.harassmentDetails || item.harassmentType?.replaceAll("_", " ") : "No harassment reported in intake."}</p>
            <p className="mt-3 text-sm font-semibold text-slate-700">{item.receivedLegalNotice ? "Legal notice / Section 138 concern reported." : "No legal notice reported."}</p>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3"><SectionTitle title="Evidence locker" count={`${item.evidenceFiles.length} files`} /><Button variant="ghost" className="text-xs"><Download size={14} /> Export</Button></div>
            <div className="mt-4 space-y-2">{item.evidenceFiles.length === 0 ? <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No evidence uploaded yet.</p> : item.evidenceFiles.map((file) => <Evidence key={file.id} name={file.fileName} meta={`${file.fileMimeType} · ${Math.ceil(file.fileSize / 1024)} KB`} icon={file.fileMimeType.startsWith("audio") ? <FileAudio /> : file.fileMimeType.startsWith("image") ? <ImageIcon /> : <FileText />} action={file.fileMimeType.startsWith("audio") ? <Play size={15} /> : <FileText size={15} />} />)}</div>
          </Card>
          <DocumentUpload caseId={item.id} />
          <Card className="p-4 sm:p-5">
            <SectionTitle title="Case timeline" />
            <div className="mt-5 space-y-5 border-l-2 border-slate-200 pl-5 text-sm"><Timeline date={item.createdAt.toLocaleString("en-IN")} title="Inquiry received" text="Borrower submitted a confidential case intake." />{item.notes.map((note) => <Timeline key={note.id} date={note.createdAt.toLocaleString("en-IN")} title={note.isInternalOnly ? "Internal strategy note" : "Client-visible update"} text={note.content} />)}</div>
          </Card>
        </div>

      </div>
      <section className="mt-5 border-t border-slate-200 pt-5">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div><p className="text-xs font-bold uppercase tracking-wider text-[#9b7b18]">Admin actions</p><h2 className="serif mt-1 text-2xl font-bold text-navy">Manage this case</h2></div>
          <p className="text-xs text-slate-500">Payment, access and client updates</p>
        </div>
        <div className="grid items-start gap-5 lg:grid-cols-[.8fr_1fr]">
          <Card className="border-gold/40 bg-[#fffdf4] p-4 sm:p-5">
            <SectionTitle title="Payment snapshot" />
            <div className="mt-4 grid grid-cols-3 gap-2 text-center"><MiniStat label="Fee" value={`₹${totalFee.toLocaleString("en-IN")}`} /><MiniStat label="Paid" value={`₹${paidAmount.toLocaleString("en-IN")}`} /><MiniStat label="Due" value={`₹${outstanding.toLocaleString("en-IN")}`} /></div>
            <p className="mt-3 text-xs text-slate-500">Gateway payment: <b className="text-navy">{item.payment?.status ?? "Pending"}</b></p>
          </Card>
          <ClientCredentials caseId={item.id} caseNumber={item.caseNumber ?? item.id} email={item.clientEmail} initialPassword={credentials.temporaryPassword} />
        </div>
        <div className="mt-5 w-full">
          <CaseOperations caseId={item.id} status={item.status} feeAmount={item.feeAmount} totalPaid={paidAmount} installments={installments} />
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ title, count }: { title: string; count?: string }) {
  return <h2 className="font-bold text-navy">{title} {count && <span className="ml-1 text-xs font-normal text-slate-400">{count}</span>}</h2>;
}
function HeaderStat({ label, value }: { label: string; value: string }) { return <div><p className="text-[10px] uppercase tracking-wider text-white/50">{label}</p><p className="mt-1 max-w-24 truncate text-xs font-bold sm:text-sm">{value}</p></div>; }
function MiniStat({ label, value }: { label: string; value: string }) { return <div className="rounded-lg bg-white p-2"><p className="text-[10px] uppercase text-slate-400">{label}</p><b className="mt-1 block truncate text-xs text-navy">{value}</b></div>; }
function Evidence({ icon, name, meta, action }: { icon: React.ReactNode; name: string; meta: string; action: React.ReactNode }) { return <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600">{icon}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-navy">{name}</p><p className="text-xs text-slate-400">{meta}</p></div><button className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-navy text-white" aria-label={`Open ${name}`}>{action}</button></div>; }
function Timeline({ date, title, text }: { date: string; title: string; text: string }) { return <div className="relative"><span className="absolute -left-[26px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-gold ring-1 ring-gold" /><p className="text-xs text-slate-400">{date}</p><p className="mt-1 font-semibold text-navy">{title}</p><p className="mt-1 text-slate-500">{text}</p></div>; }
