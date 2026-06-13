import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: `${site.name} — offline endless runner`,
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.author }],
  keywords: ["dino", "endless runner", "offline game", "chrome dino", "android game", site.studio],
  icons: { icon: "/icon.png", apple: "/icon.png" },
  openGraph: {
    title: `${site.name} — offline endless runner`,
    description: site.description,
    url: site.url,
    siteName: site.name,
    images: [{ url: "/icon.png", width: 1024, height: 1024, alt: `${site.name} icon` }],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: `${site.name} — offline endless runner`,
    description: site.description,
    images: ["/icon.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
