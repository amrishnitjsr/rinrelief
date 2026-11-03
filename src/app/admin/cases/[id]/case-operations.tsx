"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { markInstallmentPaid, updateCaseOperations } from "@/app/actions/case-actions";
import { Button, Card, Field } from "@/components/ui";

type Props = {
  caseId: string;
  status: string;
  feeAmount: number;
  totalPaid: number;
  installments: { id: string; amount: number; percentage: number; dueDate: string; status: string }[];
};

function distributePercentages(count: number) {
  if (count === 0) return [];
  const base = Math.floor((100 / count) * 100) / 100;
  return Array.from({ length: count }, (_, index) => index === count - 1 ? Number((100 - base * (count - 1)).toFixed(2)) : base);
}

function dateInputValue(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function distributeDueDates(count: number) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() + index + 1);
    return dateInputValue(date);
  });
}

export default function CaseOperations({ caseId, status, feeAmount, totalPaid, installments }: Props) {
  const router = useRouter();
  const installmentPercentages = installments.map((installment) => installment.percentage);
  const initialCount = installmentPercentages.length;
  const [installmentCount, setInstallmentCount] = useState(initialCount);
  const [percentages, setPercentages] = useState(initialCount ? installmentPercentages : []);
  const [dueDates, setDueDates] = useState(initialCount ? installments.map((installment) => dateInputValue(new Date(installment.dueDate))) : []);
  const [selectedStatus, setSelectedStatus] = useState(status);
  const [installmentFilter, setInstallmentFilter] = useState("ALL");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isMarkingPaid, startMarkingPaid] = useTransition();
  const [isUpdatingStatus, startUpdatingStatus] = useTransition();
  const [isSaving, startSaving] = useTransition();
  const totalPercentage = useMemo(() => percentages.reduce((sum, value) => sum + (Number(value) || 0), 0), [percentages]);
  const paidCount = installments.filter((installment) => installment.status === "PAID").length;
  const visibleInstallments = installments.filter((installment) => installmentFilter === "ALL" || installment.status === installmentFilter);

  function changeCount(value: string) {
    const count = Number(value);
    setInstallmentCount(count);
    setPercentages(count === 0 ? [] : percentages.length === count ? percentages : distributePercentages(count));
    setDueDates(count === 0 ? [] : dueDates.length === count ? dueDates : distributeDueDates(count));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    const formData = new FormData(event.currentTarget);
    startSaving(async () => {
      try {
        await updateCaseOperations({ caseId, ...Object.fromEntries(formData.entries()), installmentCount, installmentPercentages: JSON.stringify(percentages), installmentDueDates: JSON.stringify(dueDates) });
        setMessage("Client portal updated successfully.");
        router.refresh();
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Could not update case");
      }
    });
  }

  function markPaid(installmentId: string) {
    setError("");
    setMessage("");
    startMarkingPaid(async () => {
      try {
        await markInstallmentPaid(installmentId);
        router.refresh();
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Could not mark installment as paid");
      }
    });
  }

  function updateStatus(statusValue: string) {
    setError("");
    setMessage("");
    setSelectedStatus(statusValue);
    startUpdatingStatus(async () => {
      try {
        const response = await fetch(`/api/admin/cases/${encodeURIComponent(caseId)}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: statusValue }),
        });
        const result = await response.json() as { error?: string };
        if (!response.ok) throw new Error(result.error ?? "Could not update case status");
        setMessage("Case status updated.");
        router.refresh();
      } catch (caught) {
        setSelectedStatus(status);
        setError(caught instanceof Error ? caught.message : "Could not update case status");
      }
    });
  }

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-bold text-navy">Case controls</h2>
          <p className="mt-1 text-xs text-slate-500">Update fees, plan and client-visible information in one place.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{paidCount}/{installments.length} paid</span>
      </div>
      <form onSubmit={submit} className="mt-5 grid gap-5 lg:grid-cols-12">
        <section className="rounded-xl bg-slate-50 p-3 sm:p-4 lg:col-span-12">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-navy">Case status</h3>
            <div className="flex flex-wrap gap-1.5">
              {["INQUIRY_RECEIVED", "CONSULTATION_PAID", "LEGAL_NOTICE_SENT", "UNDER_NEGOTIATION", "SETTLEMENT_REACHED", "CLOSED"].map((quickStatus) => (
                <button key={quickStatus} type="button" disabled={isUpdatingStatus} onClick={() => updateStatus(quickStatus)} className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-transform duration-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${selectedStatus === quickStatus ? "bg-navy text-white" : "bg-white text-slate-600"}`}>{isUpdatingStatus && selectedStatus === quickStatus ? "Updating..." : quickStatus.replaceAll("_", " ")}</button>
              ))}
            </div>
          </div>
          <select name="status" value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)} className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-normal">
            {["INQUIRY_RECEIVED", "CONSULTATION_PAID", "LEGAL_NOTICE_SENT", "UNDER_NEGOTIATION", "SETTLEMENT_REACHED", "CLOSED"].map((item) => <option key={item} value={item}>{item.replaceAll("_", " ")}</option>)}
          </select>
        </section>
        <section className="min-w-0 lg:col-span-3">
          <h3 className="mb-3 text-sm font-bold text-navy">Fee and payment</h3>
          <div className="grid gap-3">
            <Field label="Agreed fee (₹)" name="feeAmount" type="number" min="0" step="0.01" defaultValue={feeAmount} required />
            <Field label="Total paid (₹)" name="totalPaid" type="number" min="0" step="0.01" defaultValue={totalPaid} required />
          </div>
        </section>
        <section className="min-w-0 lg:col-span-9">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-navy">Installment plan</h3>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">Number
              <select value={installmentCount} onChange={(event) => changeCount(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm font-normal">
            <option value="0">No installment plan</option>
            {Array.from({ length: 12 }, (_, index) => index + 1).map((count) => <option key={count} value={count}>{count} installment{count > 1 ? "s" : ""}</option>)}
              </select>
            </label>
          </div>
        {installmentCount > 0 && (
          <div className="mt-3 rounded-xl border border-slate-200 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-navy">Fee split by installment</p>
              <p className={`text-xs font-bold ${Math.abs(totalPercentage - 100) < 0.01 ? "text-emerald-600" : "text-red-600"}`}>Total: {totalPercentage.toFixed(2)}%</p>
            </div>
            <div className="mt-3 grid gap-2">
              {percentages.map((percentage, index) => (
                <label key={index} className="grid min-w-0 gap-2 text-sm text-slate-600 sm:grid-cols-[minmax(90px,110px)_minmax(100px,1fr)_auto_minmax(150px,190px)] sm:items-center">
                  <span>Installment {index + 1}</span>
                  <input type="number" min="0.01" max="100" step="0.01" value={percentage} onChange={(event) => setPercentages((current) => current.map((value, itemIndex) => itemIndex === index ? Number(event.target.value) : value))} className="min-w-0 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-gold" required />
                  <span className="hidden sm:block">%</span>
                  <input type="date" value={dueDates[index] ?? ""} onChange={(event) => setDueDates((current) => current.map((value, itemIndex) => itemIndex === index ? event.target.value : value))} className="min-w-0 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-gold" required />
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">Admin can choose each installment&apos;s due date.</p>
            <div className="mt-4 border-t border-slate-100 pt-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-navy">Payment confirmation</p>
                <select value={installmentFilter} onChange={(event) => setInstallmentFilter(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-600">
                  <option value="ALL">All payments</option><option value="PENDING">Pending only</option><option value="PAID">Paid only</option>
                </select>
              </div>
              <div className="mt-2 space-y-2">
              {visibleInstallments.map((installment) => (
                <div key={installment.id} className="flex flex-col gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <span>₹{installment.amount.toLocaleString("en-IN")} · Due {new Date(installment.dueDate).toLocaleDateString("en-IN")}</span>
                  {installment.status === "PAID" ? <span className="font-bold text-emerald-600">Paid</span> : <button type="button" disabled={isMarkingPaid} onClick={() => markPaid(installment.id)} className="w-full rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition-transform duration-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">{isMarkingPaid ? "Marking..." : "Mark as paid"}</button>}
                </div>
              ))}
              {visibleInstallments.length === 0 && <p className="py-2 text-xs text-slate-500">No installments match this filter.</p>}
              </div>
            </div>
          </div>
        )}
        </section>
        <section className="lg:col-span-12">
          <h3 className="mb-2 text-sm font-bold text-navy">Client update</h3>
        <label className="grid gap-1.5 text-sm font-semibold text-slate-700">Client-visible update
          <textarea name="clientUpdate" rows={4} placeholder="Complaint response, filing update, hearing date..." className="rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none focus:border-gold" />
        </label>
        </section>
        {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700 lg:col-span-12">{error}</p>}
        {message && <p className="rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700 lg:col-span-12">{message}</p>}
        <Button type="submit" loading={isSaving} loadingText="Saving update..." className="lg:col-span-12">Save and publish update</Button>
      </form>
    </Card>
  );
}
