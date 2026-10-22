import type { Metadata } from "next";
import { Outfit, Manrope } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Profit Plus | Automate Your Stock Investment",
  description:
    "Let AI handle your stock investments — automatically buy low and sell high with zero manual effort.",
  icons: {
    icon: "/favicon.ico",
  },
};

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WebsiteLoader from "@/components/WebsiteLoader";
import { CanonicalURL } from "@/components/canonicalURL/CanonicalURL";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${manrope.variable} scroll-smooth antialiased`}
    >
      <head>
        <meta name="google-site-verification" content="KRvW8ZeiACsNAXjSCMH8gbcVrIpTuy4io5hX__NG79c" />
        <CanonicalURL />
      </head>
      <body className="min-h-screen bg-white text-white flex flex-col font-['Manrope'] selection:bg-[#199250] selection:text-white">
        {/* Website Open Loading Overlay */}
        <WebsiteLoader />

        {/* Persistent Floating Navbar */}
        <Navbar />

        {/* Dynamic Page Content */}
        <div className="flex-1 w-full flex flex-col">
          {children}
        </div>

        {/* Persistent Footer with Radiant Glow */}
        <Footer />
      </body>
    </html>
  );
}
