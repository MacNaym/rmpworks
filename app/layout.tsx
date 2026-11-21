import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { rmpPhone } from "./contact-details";
import { shopShieldStoreId } from "./shopshield-config";

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
    default: "RMP Works | Strumenti e prodotti digitali per creator",
    template: "%s — RMP Works",
  },
  description: "RMP Works aiuta i creator indipendenti a progettare prodotti digitali, risorse gratuite e percorsi di vendita. Scopri Creator Studio e il programma Founder.",
  metadataBase: new URL("https://rmpworks.com"),
  other: {
    "contact:telephone": rmpPhone.international,
  },
  openGraph: {
    title: "RMP Works — Dal tuo canale al tuo primo prodotto digitale",
    description: "Uno studio per creator indipendenti: dalla prima risorsa gratuita al primo prodotto digitale.",
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
  const shopShieldId = shopShieldStoreId(process.env.RMP_SHOPSHIELD_STORE_ID);
  return (
    <html lang="it" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        {shopShieldId ? (
          <script
            src="https://cdn.shopshield.io/shield-uni.js"
            data-store-id={shopShieldId}
            data-network-gating="1"
          />
        ) : null}
      </head>
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
