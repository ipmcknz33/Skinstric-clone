"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";

export default function SummaryProcessingPage() {
  const router = useRouter();

  const pageRef = useRef<HTMLDivElement | null>(null);
  const squareARef = useRef<HTMLDivElement | null>(null);
  const squareBRef = useRef<HTMLDivElement | null>(null);
  const squareCRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!pageRef.current) return;

    gsap.fromTo(
      pageRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5, ease: "power2.out" },
    );

    const squares = [
      squareARef.current,
      squareBRef.current,
      squareCRef.current,
    ];

    squares.forEach((el, index) => {
      if (!el) return;
      gsap.to(el, {
        rotate: index % 2 === 0 ? "+=360" : "-=360",
        duration: 14 + index * 4,
        ease: "none",
        repeat: -1,
        transformOrigin: "50% 50%",
      });
    });

    const timeout = window.setTimeout(() => {
      router.push("/summary");
    }, 2200);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [router]);

  return (
    <main className="h-screen overflow-hidden bg-[#f4f4f2] text-[#1A1B1C]">
      <div ref={pageRef} className="relative h-screen overflow-hidden">
        <div className="absolute left-0 top-0 z-50 h-[4px] w-full bg-[#222222]" />

        <header className="absolute left-[28px] top-[18px] z-30 flex items-center gap-[10px]">
          <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#1A1B1C]">
            SKINSTRIC
          </div>
          <div className="text-[11px] font-normal uppercase tracking-[0.04em] text-black/40">
            [ SUMMARY ]
          </div>
        </header>

        <section className="absolute left-[24px] top-[62px] z-20">
          <h1 className="text-[22px] font-semibold uppercase tracking-[-0.01em] text-[#1A1B1C]">
            A. I. SUMMARY
          </h1>

          <div className="mt-[8px] space-y-[2px] text-[12px] font-normal uppercase leading-[1.35] text-[#1A1B1C]">
            <p>PREPARING YOUR RECOMMENDED FOCUS AREAS.</p>
            <p>BUILDING SUMMARY BREAKDOWN.</p>
          </div>
        </section>

        <section className="absolute inset-0 flex items-center justify-center">
          <div className="relative h-[420px] w-[420px]">
            <div
              ref={squareARef}
              className="absolute left-1/2 top-1/2 h-[240px] w-[240px] -translate-x-1/2 -translate-y-1/2 rotate-45 border border-dashed border-[#bdbdbb]"
            />
            <div
              ref={squareBRef}
              className="absolute left-1/2 top-1/2 h-[180px] w-[180px] -translate-x-1/2 -translate-y-1/2 rotate-45 border border-dashed border-[#d7d7d6]"
            />
            <div
              ref={squareCRef}
              className="absolute left-1/2 top-1/2 h-[120px] w-[120px] -translate-x-1/2 -translate-y-1/2 rotate-45 border border-dashed border-[#e3e3e1]"
            />

            <div className="absolute left-1/2 top-1/2 h-[76px] w-[76px] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#d7d8dc]" />
          </div>
        </section>
      </div>
    </main>
  );
}
