import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { rmpPhone } from "./contact-details";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "RMP Works",
    template: "%s — RMP Works",
  },
  description:
    "RMP Works costruisce prodotti semplici per problemi reali. Regolario aiuta le aziende a rimettere in ordine il lavoro organizzativo che accompagna l'AI.",
  metadataBase: new URL("https://rmpworks.com"),
  other: {
    "contact:telephone": rmpPhone.international,
  },
  openGraph: {
    title: "RMP Works — Prodotti semplici per problemi reali",
    description:
      "Regolario aiuta le aziende a rimettere in ordine formazione, organizzazione e documentazione legate all'uso dell'AI.",
    type: "website",
    locale: "it_IT",
    siteName: "RMP Works",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "RMP Works",
    url: "https://rmpworks.com",
    telephone: rmpPhone.international,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: rmpPhone.international,
      contactType: "customer support",
      availableLanguage: ["it", "en"],
    },
  };

  return (
    <html
      lang="it"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </body>
    </html>
  );
}
