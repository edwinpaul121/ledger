import type { Metadata } from "next";
import { Young_Serif } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import SiteCredits from "@/components/SiteCredits";
import "./globals.css";

const youngSerif = Young_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Ledger",
  description: "Every film, show, game, and book you've spent time with, in one record.",
};

export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${youngSerif.variable} ${GeistSans.variable}`}>
      <body className="font-sans">
        <Providers>
          <Navbar />
          {children}
          <SiteCredits />
          {modal}
        </Providers>
      </body>
    </html>
  );
}
