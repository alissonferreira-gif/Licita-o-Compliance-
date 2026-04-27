import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SENTINELA OMNI | Capital Recovery Ecosystem",
  description:
    "Recupere créditos tributários, conquiste contratos públicos e elimine juros abusivos com IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="bg-background text-foreground h-screen flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
