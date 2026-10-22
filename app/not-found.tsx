import React from "react";
import Image from "next/image";
import Link from "next/link";
import { IMAGES } from "@/constants/export";

export const metadata = {
    title: "404 - Page Not Found | Profit Plus",
    description: "We can't find the page that you're looking for. Probably the link is broken.",
};

export default function NotFound() {
    return (
        <main
            className="relative min-h-[100dvh] w-full flex flex-col items-center justify-center overflow-hidden select-none bg-[#041009]"
            style={{
                background:
                    "linear-gradient(180deg, #041009 0%, #0E3E24 45%, #082616 75%, #041009 100%)",
            }}
        >
            {/* Laptop Max-Width Stage Container (Locked to max 1600px laptop screen size) */}
            <div className="relative w-full max-w-[1600px] min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden px-4 sm:px-8 pt-24 sm:pt-32 md:pt-36 pb-12 sm:pb-16">
                {/* 3D Perspective Grid Background - Constrained to laptop frame & cut off beyond */}
                <div
                    className="absolute inset-x-0 bottom-0 h-[68vh] sm:h-[72vh] md:h-[76vh] lg:h-[80vh] pointer-events-none select-none z-0"
                    style={{
                        maskImage:
                            "linear-gradient(to top, rgba(0,0,0,1) 65%, transparent 100%)",
                        WebkitMaskImage:
                            "linear-gradient(to top, rgba(0,0,0,1) 65%, transparent 100%)",
                    }}
                >
                    <Image
                        src={IMAGES.perspectiveGrid}
                        alt="3D Perspective Floor Grid"
                        fill
                        priority
                        unoptimized
                        className="object-cover object-bottom opacity-50"
                    />
                </div>

                {/* Main Content Area - Scaled proportionally for laptop & mobile */}
                <div className="relative z-10 flex flex-col items-center text-center max-w-4xl lg:max-w-5xl mx-auto w-full my-auto">
                    {/* 404 Hero Graphic */}
                    <div className="relative w-[80vw] max-w-[280px] sm:max-w-[420px] md:max-w-[540px] lg:max-w-[680px] xl:max-w-[740px] aspect-[800/360] transition-transform duration-300 hover:scale-[1.02]">
                        <Image
                            src={IMAGES.notFoundGraphic}
                            alt="404 Error - Page not Found"
                            fill
                            priority
                            unoptimized
                            className="object-contain drop-shadow-[0_18px_35px_rgba(0,0,0,0.65)]"
                        />
                    </div>

                    {/* Heading on the Grid Floor */}
                    <h1 className="font-['Outfit'] font-bold text-3xl sm:text-4xl md:text-5xl lg:text-[56px] xl:text-[64px] text-white tracking-tight mt-6 sm:mt-8 md:mt-10 mb-2.5 sm:mb-3 drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
                        Page not Found
                    </h1>

                    {/* Subtitle Message on the Grid */}
                    <p className="font-['Manrope'] font-normal text-white/90 text-sm sm:text-base md:text-lg lg:text-xl max-w-[320px] sm:max-w-lg md:max-w-xl lg:max-w-2xl leading-relaxed mb-6 sm:mb-8 md:mb-10 px-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                        We can&apos;t find the page that you&apos;re looking for. Probably the link
                        is broken
                    </p>

                    {/* CTA Button: Back to Home on the Grid */}
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center px-8 sm:px-11 lg:px-12 py-3 sm:py-3.5 lg:py-4 rounded-full bg-[#0c4021] hover:bg-[#199250] text-white font-['Manrope'] font-semibold text-sm sm:text-base lg:text-lg border border-white/90 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_26px_rgba(25,146,80,0.7)] hover:scale-105 active:scale-95 transition-all duration-300"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </main>
    );
}