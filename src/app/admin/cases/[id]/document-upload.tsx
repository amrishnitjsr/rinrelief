"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Field } from "@/components/ui";

export default function DocumentUpload({ caseId }: { caseId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage(""); setError("");
    const form = new FormData(event.currentTarget);
    const file = form.get("file");
    if (!(file instanceof File) || file.type !== "application/pdf") { setError("Please choose a PDF file."); return; }
    setUploading(true);
    try {
      const metadata = { caseId, category: "LEGAL_NOTICE_COPY", fileName: file.name, fileMimeType: file.type, fileSize: file.size, title: form.get("title"), referenceNo: form.get("referenceNo"), isClientVisible: true };
      const response = await fetch("/api/documents/presign", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(metadata) });
      const result = await response.json() as { uploadUrl?: string; error?: string };
      if (!response.ok || !result.uploadUrl) throw new Error(result.error ?? "Could not prepare upload");
      const upload = await fetch(result.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      if (!upload.ok) throw new Error("PDF upload failed");
      setMessage("PDF uploaded and visible to the client.");
      event.currentTarget.reset();
      router.refresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "PDF upload failed"); }
    finally { setUploading(false); }
  }
  return <Card className="p-5"><h2 className="font-bold text-navy">Upload client PDF</h2><form onSubmit={submit} className="mt-4 grid gap-3"><Field label="Document title" name="title" required /><Field label="Reference number" name="referenceNo" placeholder="NOTICE-2026-001" required /><label className="grid gap-1.5 text-sm font-semibold text-slate-700">PDF file<input name="file" type="file" accept="application/pdf" required className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-normal" /></label>{error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}{message && <p className="rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{message}</p>}<Button type="submit" loading={uploading} loadingText="Uploading PDF...">Upload PDF</Button></form></Card>;
}
