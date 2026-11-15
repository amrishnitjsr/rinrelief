import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { BCIDisclaimerModal } from "@/components/compliance/BCIDisclaimerModal";
import { AuthProvider } from "@/components/auth-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rinrelife.com";
const verificationCode = process.env.NEXT_PUBLIC_GSC_VERIFICATION ?? "YOUR_VERIFICATION_CODE";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Debt Settlement & Legal Support | Rinrelife",
  description:
    "Get confidential debt settlement and legal support in India. Organise your case, respond to recovery harassment, and take your next step with confidence.",
  alternates: { canonical: "/" },
  verification: { google: verificationCode },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Debt Settlement & Legal Support | Rinrelife",
    description:
      "Confidential legal guidance, debt settlement support, and case preparation for people facing difficult legal situations.",
    siteName: "Rinrelife",
    images: [{ url: "/logos/rinrelife dark.svg", width: 420, height: 260, alt: "Rinrelife logo" }],
  },
  twitter: {
    card: "summary",
    title: "Debt Settlement & Legal Support | Rinrelife",
    description:
      "Confidential legal guidance, debt settlement support, and case preparation across India.",
    images: ["/logos/rinrelife dark.svg"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "ProfessionalService"],
      "@id": `${siteUrl}/#organization`,
      name: "Rinrelife",
      url: siteUrl,
      logo: `${siteUrl}/logos/rinrelife dark.svg`,
      description:
        "Confidential legal guidance, debt settlement support, and case preparation across India.",
      telephone: "+91 98765 43210",
      email: "alerts@nyayashield.in",
      address: {
        "@type": "PostalAddress",
        streetAddress: "B-149/5, Sharma Market, Pul Pehlad Pur",
        addressLocality: "New Delhi",
        postalCode: "110044",
        addressCountry: "IN",
      },
      areaServed: "IN",
      serviceType: ["Debt settlement", "Legal consultation", "Legal case preparation"],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: "Rinrelife",
      url: siteUrl,
      publisher: { "@id": `${siteUrl}/#organization` },
      inLanguage: "en-IN",
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={`${inter.variable} ${playfair.variable}`}>
        <AuthProvider>{children}</AuthProvider>
        <BCIDisclaimerModal />
      </body>
    </html>
  );
}
