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

const siteUrl = "https://kuangxu.org";

export const metadata: Metadata = {
  title: "Kuang Xu",
  description: "Founder. Investor. Writing about AI systems, capital, and the math underneath both.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Kuang Xu",
    title: "Kuang Xu",
    description: "Founder. Investor. Writing about AI systems, capital, and the math underneath both.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@ProfKuang",
    creator: "@ProfKuang",
    title: "Kuang Xu",
    description: "Founder. Investor. Writing about AI systems, capital, and the math underneath both.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-white text-black min-h-screen">{children}</body>
    </html>
  );
}
