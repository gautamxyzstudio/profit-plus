"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IMAGES } from "@/constants/export";

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }
  return (
    <div className="w-full bg-white">
      <footer className="relative bg-white text-zinc-900 rounded-t-[36px] sm:rounded-t-[48px] pt-14 sm:pt-18 pb-10 sm:pb-12 px-6 sm:px-10 lg:px-16 overflow-hidden z-20 border border-gray-200 shadow-[0_-12px_40px_rgba(0,0,0,0.04)]">
        {/* Radiant Top Glow Circle with exact Figma circle dimensions (1093px x 1093px, rounded-full) */}
        <div
          className="footer-top-glow absolute left-1/2 -translate-x-1/2 pointer-events-none select-none z-0 w-[650px] h-[650px] sm:w-[850px] sm:h-[850px] md:w-[1293px] md:h-[620px] -top-[530px] sm:-top-[710px] md:-top-[530px] rounded-full"
        />

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Main 4-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
            {/* Column 1: Brand Info & Socials (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                {/* Official Profit Plus Logo */}
                <Link href="/" className="inline-block mb-5 select-none">
                  <Image
                    src={IMAGES.logo}
                    alt="Profit Plus"
                    width={380}
                    height={250}
                    className="h-10 sm:h-12 lg:h-20 w-auto object-contain block"
                    priority
                    unoptimized
                  />
                </Link>

                {/* Bio / Description */}
                <p className="font-['Manrope'] font-normal text-xs sm:text-[13px] lg:text-[16px] leading-relaxed text-[#374151] max-w-sm">
                  ProfitPlus helps traders automate futures trading with reliable
                  trade execution and multi-account trade copying. Our platform is
                  designed to simplify trading workflows, reduce manual effort, and
                  provide a smoother trading experience with flexible automation
                  tools.
                </p>
              </div>
              {/* Social Media Icons */}
              <div className="flex items-center gap-2 mt-6 sm:mt-8 text-black">
                {/* TikTok */}
                <a
                  href="https://www.tiktok.com/@officialprofitplus"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:text-[#199250] hover:scale-110 transition-transform duration-200"
                >
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.32a6.34 6.34 0 0 0-.85-.06A6.34 6.34 0 0 0 3 15.6a6.34 6.34 0 0 0 10.82 4.48c1.37-1.37 2.07-3.1 2.07-5.18V8.71a8.28 8.28 0 0 0 4.7 1.48v-3.5z" />
                  </svg>
                </a>

                {/* Facebook */}
                <a
                  href="https://www.facebook.com/profit.plus"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:text-[#199250] hover:scale-110 transition-transform duration-200"
                >
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/pro.fitplus"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:text-[#199250] hover:scale-110 transition-transform duration-200"
                >
                  <svg
                    className="w-6 h-6 fill-none stroke-current"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>

                {/* YouTube */}
                <a
                  href="https://www.youtube.com/@OFFICIALPROFITPLUS"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:text-[#199250] hover:scale-110 transition-transform duration-200"
                >
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2: Menu (2 cols) */}
            <div className="lg:col-span-2">
              <h4 className="font-['Outfit'] font-bold text-base sm:text-[17px] lg:text-[20px] text-[#111827] mb-3 sm:mb-4 tracking-tight">
                Menu
              </h4>
              <ul className="space-y-2 font-['Manrope'] text-xs sm:text-[13px] lg:text-[16px] text-[#374151]">
                <li>
                  <Link href="/" className="hover:text-[#199250] transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-[#199250] transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-[#199250] transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-[#199250] transition-colors">
                    Blogs
                  </Link>
                </li>
                <li>
                  <Link href="/success-story" className="hover:text-[#199250] transition-colors">
                    Success Stories
                  </Link>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-3">
              <h4 className="font-['Outfit'] font-bold text-base sm:text-[17px] lg:text-[20px] text-[#111827] mb-3 sm:mb-4 tracking-tight">
                Quick Links
              </h4>
              <ul className="space-y-2 font-['Manrope'] text-xs sm:text-[13px] lg:text-[16px] text-[#374151]">
                <li>
                  <Link href="/faq" className="hover:text-[#199250] transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/us-government-disclaimer"
                    className="hover:text-[#199250] transition-colors"
                  >
                    U.S. Government Disclaimer
                  </Link>
                </li>
                <li>
                  <Link href="/terms-conditions" className="hover:text-[#199250] transition-colors">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="hover:text-[#199250] transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/earnings-disclaimer" className="hover:text-[#199250] transition-colors">
                    Earnings Disclaimer
                  </Link>
                </li>
                <li>
                  <Link href="/risk-disclaimer" className="hover:text-[#199250] transition-colors">
                    Risk Disclaimer
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Address (2 cols) */}
            <div className="lg:col-span-2">
              <h4 className="font-['Outfit'] font-bold text-base sm:text-[17px] lg:text-[20px] text-[#111827] mb-3 sm:mb-4 tracking-tight">
                Address
              </h4>
              <div className="font-['Manrope'] text-xs sm:text-[13px] lg:text-[16px] text-[#374151] leading-relaxed">
                <Link href="https://maps.app.goo.gl/uMwWDcdzC5BGbe9J6">1337 WOOD THRUSH CT, GREENWOOD, IN 46143</Link>
              </div>
              <a
                href="mailto:Sales@profitplus.us"
                className="font-['Manrope'] text-xs sm:text-[13px] lg:text-[16px] text-[#374151] hover:text-[#199250] transition-colors inline-block mt-3"
              >
                Sales@profitplus.us
              </a>
            </div>
          </div>

          {/* Regulatory Risk Disclaimer Bar matching user's reference image */}
          <div className="border-t border-zinc-200/70 pt-6 mt-10">
            <p className="font-['Manrope'] text-[11px] sm:text-xs lg:text-[15px] text-zinc-500 leading-relaxed">
              Trading futures and other financial instruments involves significant
              risk and may not be suitable for every investor. ProfitPlus provides
              software and automation tools to assist with trade execution and
              management but does not guarantee profits or eliminate the risk of
              loss. Always evaluate your financial situation, understand the risks
              involved, and seek independent financial advice if needed. Trade
              responsibly and only invest funds you can afford to risk.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
