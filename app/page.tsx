"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";

type HoverSide = "left" | "right" | null;

export default function HomePage() {
  const router = useRouter();
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const [hoverSide, setHoverSide] = useState<HoverSide>(null);

  useEffect(() => {
    if (!titleRef.current) return;

    gsap.fromTo(
      titleRef.current,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power3.out",
      },
    );
  }, []);

  useEffect(() => {
    if (!titleRef.current) return;

    const el = titleRef.current;

    if (hoverSide === "left") {
      gsap.to(el, {
        x: 260,
        y: -10,
        scale: 0.98,
        duration: 0.9,
        ease: "power3.out",
      });
      return;
    }

    if (hoverSide === "right") {
      gsap.to(el, {
        x: -260,
        y: -10,
        scale: 0.98,
        duration: 0.9,
        ease: "power3.out",
      });
      return;
    }

    gsap.to(el, {
      x: 0,
      y: 0,
      scale: 1,
      duration: 0.9,
      ease: "power3.out",
    });
  }, [hoverSide]);

  const goToTest = () => {
    router.push("/test");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4f4f2] text-black">
      <header className="absolute top-0 left-0 z-30 flex w-full items-start justify-between px-6 py-5">
        <div className="text-[11px] font-medium uppercase tracking-[0.08em]">
          Skinstric <span className="text-black/40">[ Intro ]</span>
        </div>

        <button className="border border-black bg-black px-3 py-2 text-[10px] uppercase tracking-[0.08em] text-white transition hover:bg-white hover:text-black">
          Enter Code
        </button>
      </header>

      <section className="relative flex min-h-screen items-center justify-center">
        {/* LEFT HOVER ZONE */}
        <div
          className="absolute left-0 top-1/2 z-20 hidden h-[500px] w-[18vw] -translate-y-1/2 cursor-pointer md:block"
          onMouseEnter={() => setHoverSide("left")}
          onMouseLeave={() => setHoverSide(null)}
        >
          <div className="absolute left-0 top-1/2 h-[1px] w-full origin-left rotate-45 bg-black/20" />
          <div className="absolute left-0 top-1/2 h-[1px] w-full origin-left -rotate-45 bg-black/20" />

          <div className="absolute left-12 top-1/2 flex -translate-y-1/2 items-center gap-3">
            <div className="relative flex h-8 w-8 rotate-45 items-center justify-center border border-black">
              <span className="absolute -rotate-45 text-[11px] leading-none">
                ◀
              </span>
            </div>
            <span className="text-[12px] uppercase">Discover A.I.</span>
          </div>
        </div>

        {/* RIGHT HOVER ZONE */}
        <button
          type="button"
          aria-label="Take Test"
          className="absolute right-0 top-1/2 z-20 hidden h-[500px] w-[18vw] -translate-y-1/2 cursor-pointer md:block"
          onMouseEnter={() => setHoverSide("right")}
          onMouseLeave={() => setHoverSide(null)}
          onClick={goToTest}
        >
          <div className="absolute right-0 top-1/2 h-[1px] w-full origin-right -rotate-45 bg-black/20" />
          <div className="absolute right-0 top-1/2 h-[1px] w-full origin-right rotate-45 bg-black/20" />

          <div className="absolute right-12 top-1/2 flex -translate-y-1/2 items-center gap-3">
            <span className="text-[12px] uppercase">Take Test</span>
            <div className="relative flex h-8 w-8 rotate-45 items-center justify-center border border-black">
              <span className="absolute -rotate-45 text-[11px] leading-none">
                ▶
              </span>
            </div>
          </div>
        </button>

        {/* TITLE */}
        <h1
          ref={titleRef}
          className="text-center text-[60px] font-normal leading-[0.95] tracking-[-0.05em] md:text-[110px] lg:text-[130px]"
        >
          Sophisticated
          <br />
          skincare
        </h1>

        {/* Bottom text */}
        <div className="absolute bottom-10 left-6 max-w-[260px] text-[12px] uppercase leading-[1.4]">
          Skinstric developed an A.I. that creates a highly-personalized routine
          tailored to what your skin needs.
        </div>

        {/* Mobile CTA */}
        <button
          type="button"
          onClick={goToTest}
          className="absolute bottom-10 right-6 border border-black px-4 py-3 text-[11px] uppercase tracking-[0.08em] transition hover:bg-black hover:text-white md:hidden"
        >
          Take Test
        </button>
      </section>
    </main>
  );
}
