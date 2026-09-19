import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ledger.abdelhadygabriel.me"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "Build Ledger — Projects + Campaigns Tracker",
    description: "Local-first PWA for tracking the projects you build AND your marketing campaigns across social media.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Build Ledger — Projects + Campaigns Tracker" }],
    url: "https://ledger.abdelhadygabriel.me",
    siteName: "Build Ledger",
    type: "website",
  },
  title: "Build Ledger — Projects + Campaigns Tracker",
  description:
    "Local-first PWA for tracking the projects you build AND your marketing campaigns across social media. Plan with a calendar, track engagement, hit your goals.",
  applicationName: "Build Ledger",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Build Ledger",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#8b5cf6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
