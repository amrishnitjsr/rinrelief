import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Check, ShieldCheck } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PaymentButton } from "@/components/payment-button";
import { Button, Card } from "@/components/ui";
import { CURRENT_PAYMENT_AMOUNT } from "@/lib/payments";

export default async function PaymentPage({ params }: { params: Promise<{ caseId: string }> }) {
  const session = await auth();
  const { caseId } = await params;
  const callbackUrl = `/payments/${encodeURIComponent(caseId)}`;
  if (!session?.user?.email || session.user.role !== "CLIENT") {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const debtCase = await prisma.debtCase.findUnique({ where: { id: caseId }, include: { payment: true } });
  const ownsCase =
    debtCase &&
    (debtCase.clientEmail.toLowerCase() === session.user.email.toLowerCase() ||
      (session.user.phone && debtCase.clientPhone === session.user.phone));
  if (!ownsCase) notFound();
  if (debtCase.payment?.status === "CAPTURED") redirect("/dashboard");

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-12 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-navy">
          <ArrowLeft size={16} /> Back to dashboard
        </Link>
        <Card className="mt-8 overflow-hidden">
          <div className="bg-navy p-8 text-white sm:p-10">
            <ShieldCheck size={30} className="text-gold" />
            <p className="mt-6 text-xs font-bold uppercase tracking-[.18em] text-gold">Secure consultation payment</p>
            <h1 className="serif mt-3 text-4xl font-bold">Take the next step with clarity.</h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-white/70">Your payment is processed securely by Razorpay. We will update your case as soon as the payment is verified.</p>
          </div>
          <div className="p-8 sm:p-10">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Case</p>
                <p className="mt-2 font-mono text-sm font-bold text-navy">{debtCase.caseNumber ?? debtCase.id}</p>
              </div>
              <p className="text-3xl font-bold text-navy">₹{CURRENT_PAYMENT_AMOUNT.toLocaleString("en-IN")}</p>
            </div>
            <div className="mt-6 space-y-3 text-sm text-slate-600">
              <p className="flex items-center gap-2"><Check size={16} className="text-emerald-600" /> 30-minute advocate consultation</p>
              <p className="flex items-center gap-2"><Check size={16} className="text-emerald-600" /> Case triage and recovery-response plan</p>
              <p className="flex items-center gap-2"><Check size={16} className="text-emerald-600" /> Payment receipt issued after verification</p>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-slate-50 p-4">
              <p className="text-xs leading-5 text-slate-500">Payments are handled in INR through Razorpay test or live mode, based on your configured account.</p>
              <PaymentButton caseId={debtCase.id} amount={CURRENT_PAYMENT_AMOUNT} />
            </div>
          </div>
        </Card>
        <div className="mt-6 text-center"><Link href="/dashboard"><Button variant="ghost">View case timeline</Button></Link></div>
      </div>
    </main>
  );
}