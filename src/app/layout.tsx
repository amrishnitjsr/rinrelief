import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { BCIDisclaimerModal } from "@/components/compliance/BCIDisclaimerModal";
const inter = Inter({ subsets:["latin"], variable:"--font-inter" });
const playfair = Playfair_Display({ subsets:["latin"], variable:"--font-playfair" });
export const metadata: Metadata = { title:"Rinrelife | Debt Settlement & Legal Protection", description:"Confidential debt settlement and recovery harassment legal consultancy." };
export default function RootLayout({ children }:{children:React.ReactNode}) { return <html lang="en"><body className={`${inter.variable} ${playfair.variable}`}>{children}<BCIDisclaimerModal /></body></html>; }
