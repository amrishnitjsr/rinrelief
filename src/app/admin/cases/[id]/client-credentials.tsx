"use client";

import { useState } from "react";
import { regenerateClientPassword } from "@/app/actions/case-actions";
import { Button, Card } from "@/components/ui";

export default function ClientCredentials({ caseId, caseNumber, email, initialPassword }: { caseId: string; caseNumber: string; email: string; initialPassword?: string | null }) {
  const [credentials, setCredentials] = useState<{ caseNumber: string; email: string; temporaryPassword: string }>({ caseNumber, email, temporaryPassword: initialPassword ?? "" });
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  async function regenerate() {
    setError("");
    setGenerating(true);
    try {
      setCredentials(await regenerateClientPassword(caseId));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not generate password");
    } finally { setGenerating(false); }
  }
  return (
    <Card className="p-5">
      <h2 className="font-bold text-navy">Client login credentials</h2>
      <p className="mt-2 text-sm text-slate-500">Email: <b className="text-navy">{email}</b></p>
      <p className="mt-1 text-sm text-slate-500">Case ID: <b className="font-mono text-navy">{caseNumber}</b></p>
      {credentials.temporaryPassword && <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900"><p>Temporary password:</p><b className="mt-1 block font-mono text-lg">{credentials.temporaryPassword}</b><p className="mt-2 text-xs">This credential remains available to authorized admins until the client changes it.</p></div>}
      {error && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <Button type="button" loading={generating} loadingText="Generating password..." onClick={regenerate} className="mt-4 w-full">Generate new temporary password</Button>
    </Card>
  );
}
