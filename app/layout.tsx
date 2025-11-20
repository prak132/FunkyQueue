import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FRC Machining Queue",
  description: "Manage your CAM and Machining jobs efficiently.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased bg-funky-black text-funky-text`}
      >
        {/* We might want to conditionally render Navbar or use route groups. 
            For now, we'll assume the Navbar handles its own visibility or we accept it on auth pages (though not ideal).
            Actually, let's just render it. The user can refactor later if they want auth pages clean. 
            Or better: The Navbar is fixed, so we need padding.
        */}
        <Navbar />
        <main className="pt-16 pb-20 md:pb-0 md:pl-0 min-h-screen">
          {children}
        </main>
        <Toaster position="top-center" theme="dark" />
      </body>
    </html>
  );
}

import { Toaster } from 'sonner'
