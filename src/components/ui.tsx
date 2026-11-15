"use client";
import { useState } from "react";
function clsx(...values:(string|false|undefined)[]){return values.filter(Boolean).join(" ")}
type ButtonProps = {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "outline" | "ghost" | "danger";
  loading?: boolean;
  loadingText?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({children,className="",variant="primary",loading=false,loadingText="Processing...",onClick,disabled,...props}:ButtonProps) {
  const [clicked, setClicked] = useState(false);
  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    if (loading || disabled) return;
    setClicked(true);
    window.setTimeout(() => setClicked(false), 700);
    onClick?.(event);
  }
  const styles={primary:"bg-navy text-white hover:bg-slate-800",outline:"border border-slate-300 bg-white text-navy hover:border-gold",ghost:"text-slate-600 hover:bg-slate-100",danger:"bg-red-50 text-red-700 hover:bg-red-100"};
  return <button className={clsx("inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-transform duration-100 ease-out active:scale-95 disabled:cursor-not-allowed disabled:opacity-80", clicked && "ring-2 ring-gold/50", styles[variant],className)} onClick={handleClick} aria-busy={loading || clicked} disabled={loading || disabled} {...props}>{loading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> {loadingText}</> : children}</button>;
}
export function Card({children,className=""}:{children:React.ReactNode;className?:string}){return <div className={clsx("rounded-2xl border border-slate-200 bg-white shadow-soft",className)}>{children}</div>}
export function Badge({children,tone="slate"}:{children:React.ReactNode;tone?:string}){const s:Record<string,string>={red:"bg-red-100 text-red-700",amber:"bg-amber-100 text-amber-800",green:"bg-emerald-100 text-emerald-700",blue:"bg-blue-100 text-blue-700",slate:"bg-slate-100 text-slate-600",gold:"bg-[#f8f1d8] text-[#8a6d14]"};return <span className={clsx("rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",s[tone]||s.slate)}>{children}</span>}
export function Field({label, ...props}:{label:string}&React.InputHTMLAttributes<HTMLInputElement>){return <label className="grid gap-1.5 text-sm font-semibold text-slate-700">{label}<input className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 font-normal outline-none transition placeholder:text-slate-400 focus:border-gold focus:ring-2 focus:ring-gold/20" {...props}/></label>}
