"use client";

import { useEffect, useState } from "react";
import { Check, Star, X } from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";

type FeedbackRow = {
  id: string;
  name: string;
  city: string;
  rating: number;
  message: string;
  approved: boolean;
  isDemo: boolean;
  createdAt: string;
};

export default function FeedbackModerationPage() {
  const [items, setItems] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string>();
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/feedback")
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load feedback");
        setItems(await response.json() as FeedbackRow[]);
      })
      .catch(() => setError("Unable to load feedback."))
      .finally(() => setLoading(false));
  }, []);

  async function moderate(id: string, approved: boolean) {
    setUpdating(id);
    setError("");
    try {
      const response = await fetch("/api/admin/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, approved }),
      });
      if (!response.ok) throw new Error("Unable to update feedback");
      setItems((current) => current.map((item) => item.id === id ? { ...item, approved } : item));
    } catch {
      setError("Unable to update this feedback.");
    } finally {
      setUpdating(undefined);
    }
  }

  return (
    <>
      <div>
        <p className="text-sm font-bold uppercase tracking-widest text-[#9b7b18]">Public content</p>
        <h1 className="serif mt-1 text-4xl font-bold text-navy">Feedback moderation</h1>
        <p className="mt-2 text-sm text-slate-500">Approve only feedback that is appropriate to display publicly.</p>
      </div>
      {error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
      {loading ? <Card className="mt-7 p-8 text-sm text-slate-500">Loading feedback...</Card> : items.length === 0 ? <Card className="mt-7 p-8 text-sm text-slate-500">No feedback submitted yet.</Card> : <div className="mt-7 space-y-4">{items.map((item) => <Card key={item.id} className="p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2"><h2 className="font-bold text-navy">{item.name}</h2><span className="text-sm text-slate-500">· {item.city}</span></div><div className="mt-2 flex items-center gap-1 text-[#b18a20]">{Array.from({ length: 5 }, (_, index) => <Star key={index} size={15} fill={index < item.rating ? "currentColor" : "none"} />)}</div></div><Badge tone={item.approved ? "green" : "amber"}>{item.approved ? "Published" : "Pending review"}</Badge></div><p className="mt-4 text-sm leading-6 text-slate-700">{item.message}</p><div className="mt-5 flex flex-wrap gap-2">{!item.approved && <Button loading={updating === item.id} loadingText="Approving..." onClick={() => moderate(item.id, true)}><Check size={15} /> Approve</Button>}{item.approved && <Button variant="outline" loading={updating === item.id} loadingText="Hiding..." onClick={() => moderate(item.id, false)}><X size={15} /> Hide</Button>}</div></Card>)}</div>}
    </>
  );
}
