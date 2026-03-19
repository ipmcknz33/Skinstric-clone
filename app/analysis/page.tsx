// app/analysis/page.tsx
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function AnalysisPage() {
  const pageRef = useRef<HTMLDivElement | null>(null);
  const squareARef = useRef<HTMLDivElement | null>(null);
  const squareBRef = useRef<HTMLDivElement | null>(null);
  const squareCRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!pageRef.current) return;

    gsap.fromTo(
      pageRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.45, ease: "power2.out" },
    );

    const squares = [
      squareARef.current,
      squareBRef.current,
      squareCRef.current,
    ];

    squares.forEach((el, index) => {
      if (!el) return;

      gsap.to(el, {
        rotate: index === 1 ? "-=360" : "+=360",
        duration: 16 + index * 4,
        ease: "none",
        repeat: -1,
        transformOrigin: "50% 50%",
      });
    });
  }, []);

  return (
    <main className="h-[100dvh] overflow-hidden bg-[#f4f4f2] text-[#1A1B1C]">
      <div
        ref={pageRef}
        className="relative flex h-full w-full items-center justify-center"
      >
        <div className="relative flex h-[360px] w-[360px] items-center justify-center">
          <div
            ref={squareARef}
            className="absolute h-[220px] w-[220px] rotate-[34deg] border border-dashed border-black/18"
            style={{ willChange: "transform" }}
          />
          <div
            ref={squareBRef}
            className="absolute h-[220px] w-[220px] rotate-[8deg] border border-dashed border-black/22"
            style={{ willChange: "transform" }}
          />
          <div
            ref={squareCRef}
            className="absolute h-[220px] w-[220px] rotate-[-22deg] border border-dashed border-black/16"
            style={{ willChange: "transform" }}
          />

          <p className="relative z-10 text-center text-[14px] font-semibold uppercase tracking-[0.02em] text-black">
            Preparing your analysis ...
          </p>
        </div>
      </div>
    </main>
  );
}
