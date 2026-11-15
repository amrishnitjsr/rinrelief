"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Card } from "@/components/ui";

const demoFeedback = [
  { id: "demo-1", name: "Ananya Mehta", city: "Pune", rating: 5, message: "The team helped me understand my options and respond calmly to recovery calls.", isDemo: true },
  { id: "demo-2", name: "Rahul Verma", city: "Jaipur", rating: 5, message: "Clear communication and a practical plan made a difficult situation feel manageable.", isDemo: true },
  { id: "demo-3", name: "Priya Nair", city: "Bengaluru", rating: 4, message: "I appreciated the structured guidance and regular updates throughout my consultation.", isDemo: true },
];

type Feedback = typeof demoFeedback[number];

function uniqueFeedback(items: Feedback[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.name.trim().toLowerCase()}|${item.city.trim().toLowerCase()}|${item.rating}|${item.message.trim().toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function FeedbackSection() {
  const [items, setItems] = useState<Feedback[]>(uniqueFeedback(demoFeedback));
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let active = true;
    fetch("/api/feedback")
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load feedback");
        return response.json() as Promise<Feedback[]>;
      })
      .then((feedback) => {
        if (active && feedback.length > 0) {
          const storedIds = new Set(feedback.map((item) => item.id));
          setItems(uniqueFeedback([...feedback, ...demoFeedback.filter((item) => !storedIds.has(item.id))]));
          setActiveIndex(0);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (items.length < 2) return;
    const timer = window.setInterval(() => setActiveIndex((index) => (index + 1) % items.length), 5_000);
    return () => window.clearInterval(timer);
  }, [items.length]);

  return (
    <section id="feedback" className="bg-[#f5f1e8] px-5 py-20 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.22em] text-[#9a7413]">Client feedback</p>
            <h2 className="mt-4 text-5xl font-black leading-none tracking-[-.06em] text-espresso sm:text-6xl">What people say.</h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-espresso/60">Approved client feedback is shown here. Clients can share feedback privately from their dashboard.</p>
          </div>
        </div>
        <div className="relative mt-12">
          <div className="grid gap-4 md:grid-cols-3">
            {items.slice(activeIndex, activeIndex + 3).concat(items.slice(0, Math.max(0, activeIndex + 3 - items.length))).map((item) => (
              <Card key={item.id} className="p-6">
                <div className="flex items-center gap-1 text-[#b18a20]">{Array.from({ length: 5 }, (_, index) => <Star key={index} size={15} fill={index < item.rating ? "currentColor" : "none"} />)}</div>
                <p className="mt-5 text-sm leading-7 text-espresso/70">“{item.message}”</p>
                <div className="mt-6 border-t border-espresso/10 pt-4 text-sm font-bold text-espresso">{item.name}<span className="font-normal text-espresso/50"> · {item.city}</span></div>
                {item.isDemo && <span className="mt-2 inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-800">Demo feedback</span>}
              </Card>
            ))}
          </div>
          {items.length > 3 && <div className="mt-6 flex items-center justify-between">
            <p className="text-xs font-semibold text-espresso/50">Showing {activeIndex + 1}–{Math.min(activeIndex + 3, items.length)} of {items.length} feedback entries</p>
            <div className="flex gap-2">
              <button type="button" aria-label="Previous feedback" onClick={() => setActiveIndex((index) => (index - 1 + items.length) % items.length)} className="grid h-10 w-10 place-items-center rounded-full border border-espresso/20 text-espresso transition hover:border-gold hover:bg-white"><ChevronLeft size={18} /></button>
              <button type="button" aria-label="Next feedback" onClick={() => setActiveIndex((index) => (index + 1) % items.length)} className="grid h-10 w-10 place-items-center rounded-full border border-espresso/20 text-espresso transition hover:border-gold hover:bg-white"><ChevronRight size={18} /></button>
            </div>
          </div>}
        </div>
      </div>
    </section>
  );
}
