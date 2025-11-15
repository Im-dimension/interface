import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PWARegister from "./pwa-register";
import ThirdwebProviderWrapper from "@/components/providers/thirdweb-provider";
import { NavigationTabs } from "@/components/navigation-tabs";
import { PWAInstaller } from "@/components/pwa-installer";
import { LayoutClient } from "@/components/layout/layout-client";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Impossible Dimension",
  description: "A Next.js app with PWA support.",
  manifest: "/manifest.json",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThirdwebProviderWrapper>
          <PWARegister />
          <div className="min-h-screen bg-red-600 p-4 md:p-8 lg:p-12">
            <div className="fixed inset-0 m-4 md:m-8 lg:m-12 bg-purple-300 rounded-4xl px-4 md:px-6 pb-4 md:pb-6 overflow-hidden flex flex-col border-4 border-dashed border-[rgba(74,26,138,0.5)] shadow-[inset_0_4px_20px_rgba(0,0,0,0.2),inset_0_-2px_10px_rgba(255,255,255,0.1)]">
              <div className="absolute top-0 left-0 right-0">
                <NavigationTabs />
              </div>
              <main className="max-w-7xl mx-auto px-4 py-6 lg:py-12 flex flex-col flex-1 min-h-0 gap-4 md:gap-6 pt-16 md:pt-20">
                <LayoutClient />
                {children}
              </main>
            </div>
          </div>
          <PWAInstaller />
        </ThirdwebProviderWrapper>
      </body>
    </html>
  );
}
