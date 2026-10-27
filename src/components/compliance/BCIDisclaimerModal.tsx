"use client";
import { useEffect, useState } from "react";
import { Scale, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui";
export function BCIDisclaimerModal(){
 const [open,setOpen]=useState(false);
 useEffect(()=>{setOpen(localStorage.getItem("bci_consent")!=="true")},[]);
 if(!open)return null;
 return <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/75 p-4 backdrop-blur-md">
  <div className="w-full max-w-lg rounded-3xl border border-white/15 bg-white p-7 shadow-2xl">
   <div className="mb-6 flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f8f1d8] text-[#9b7b18]"><Scale/></div><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#9b7b18]">Before you continue</p><h2 className="serif text-2xl font-bold text-navy">Professional responsibility</h2></div></div>
   <p className="leading-7 text-slate-600">The information on Rinrelife is educational and general in nature. Any debt-relief insight or legal representation is subject to a separate consultation and conforms to Bar Council of India rules, including non-solicitation requirements. This website does not create an advocate-client relationship or guarantee an outcome.</p>
   <div className="mt-5 flex gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600"><ShieldCheck className="mt-0.5 shrink-0 text-emerald-600" size={18}/><span>Your information remains confidential and is used only to respond to your request.</span></div>
   <div className="mt-7 flex gap-3"><Button className="flex-1" onClick={()=>{localStorage.setItem("bci_consent","true");setOpen(false)}}>I Agree & Continue</Button><Button variant="outline" onClick={()=>window.location.href="https://www.google.com"}>Exit</Button></div>
  </div>
 </div>
}
