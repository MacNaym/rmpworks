import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
  return (
    <html
      lang="it"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
