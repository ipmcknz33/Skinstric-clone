"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";

const prompts = ["Introduce Yourself", "your city name"];

type FlowStep = 0 | 1 | 2 | 3;

export default function TestPage() {
  const router = useRouter();

  const pageRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const squareOneRef = useRef<HTMLDivElement | null>(null);
  const squareTwoRef = useRef<HTMLDivElement | null>(null);
  const squareThreeRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const dotsRef = useRef<HTMLDivElement | null>(null);

  const [step, setStep] = useState<FlowStep>(0);
  const [values, setValues] = useState(["", ""]);

  useEffect(() => {
    if (!pageRef.current || !contentRef.current) return;

    const tl = gsap.timeline();

    tl.fromTo(
      pageRef.current,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
      },
    ).fromTo(
      contentRef.current,
      { y: 18, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: "power3.out",
      },
      "-=0.15",
    );

    if (squareOneRef.current) {
      gsap.to(squareOneRef.current, {
        rotate: "+=360",
        duration: 30,
        ease: "none",
        repeat: -1,
        transformOrigin: "50% 50%",
      });
    }

    if (squareTwoRef.current) {
      gsap.to(squareTwoRef.current, {
        rotate: "-=360",
        duration: 36,
        ease: "none",
        repeat: -1,
        transformOrigin: "50% 50%",
      });
    }

    if (squareThreeRef.current) {
      gsap.to(squareThreeRef.current, {
        rotate: "+=360",
        duration: 44,
        ease: "none",
        repeat: -1,
        transformOrigin: "50% 50%",
      });
    }
  }, []);

  useEffect(() => {
    if (!panelRef.current) return;

    gsap.fromTo(
      panelRef.current,
      { opacity: 0, y: 10 },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: "power2.out",
      },
    );
  }, [step]);

  useEffect(() => {
    if (step !== 2) return;

    if (dotsRef.current) {
      gsap.fromTo(
        dotsRef.current.children,
        { opacity: 0.2, y: 0 },
        {
          opacity: 1,
          y: -2,
          duration: 0.45,
          stagger: 0.12,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
        },
      );
    }

    const timer = window.setTimeout(() => {
      setStep(3);
    }, 1800);

    return () => {
      window.clearTimeout(timer);
      if (dotsRef.current) {
        gsap.killTweensOf(dotsRef.current.children);
      }
    };
  }, [step]);

  const currentValue = step <= 1 ? values[step] : "";
  const currentPrompt = step <= 1 ? prompts[step] : "";

  const updateCurrentValue = (nextValue: string) => {
    if (step > 1) return;

    setValues((prev) => {
      const next = [...prev];
      next[step] = nextValue;
      return next;
    });
  };

  const goNext = () => {
    if (step === 0) {
      if (!values[0].trim()) return;
      setStep(1);
      return;
    }

    if (step === 1) {
      if (!values[1].trim()) return;
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 0) {
      router.push("/");
      return;
    }

    if (step === 1) {
      setStep(0);
      return;
    }

    if (step === 2) {
      setStep(1);
      return;
    }

    if (step === 3) {
      setStep(1);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4f4f2] text-black">
      <div
        ref={pageRef}
        className="relative min-h-screen overflow-hidden px-3 py-2 md:px-3 md:py-2"
      >
        <header className="absolute left-0 top-0 z-30 flex w-full items-start justify-between px-3 py-2">
          <div className="text-[11px] font-semibold uppercase tracking-[0.06em]">
            Skinstric{" "}
            <span className="ml-2 font-normal text-black/40">[ Intro ]</span>
          </div>

          <button className="border border-black bg-black px-3 py-2 text-[9px] font-medium uppercase tracking-[0.06em] text-white transition hover:bg-white hover:text-black">
            Enter Code
          </button>
        </header>

        <div ref={contentRef} className="relative min-h-screen">
          <div className="absolute left-3 top-[46px] z-20">
            <p className="text-[12px] font-semibold uppercase tracking-[0.01em] text-black">
              To Start Analysis
            </p>
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative h-[420px] w-[420px] md:h-[520px] md:w-[520px]">
              <div
                ref={squareOneRef}
                className="absolute left-1/2 top-1/2 h-[250px] w-[250px] -translate-x-1/2 -translate-y-1/2 rotate-45 border border-dashed border-black/12 md:h-[300px] md:w-[300px]"
              />
              <div
                ref={squareTwoRef}
                className="absolute left-1/2 top-1/2 h-[290px] w-[290px] -translate-x-1/2 -translate-y-1/2 rotate-45 border border-dashed border-black/12 md:h-[350px] md:w-[350px]"
              />
              <div
                ref={squareThreeRef}
                className="absolute left-1/2 top-1/2 h-[330px] w-[330px] -translate-x-1/2 -translate-y-1/2 rotate-45 border border-dashed border-black/12 md:h-[400px] md:w-[400px]"
              />
            </div>
          </div>

          <section className="relative z-10 flex min-h-screen items-center justify-center">
            <div
              ref={panelRef}
              className="flex w-full max-w-[980px] flex-col items-center justify-center px-4"
            >
              {step <= 1 && (
                <>
                  <p className="mb-2 text-[11px] uppercase tracking-[0.04em] text-[#a0a0a0]">
                    Click To Type
                  </p>

                  <div className="w-full max-w-[760px]">
                    <input
                      type="text"
                      value={currentValue}
                      onChange={(e) => updateCurrentValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          goNext();
                        }
                      }}
                      placeholder={currentPrompt}
                      autoFocus
                      className="w-full border-0 border-b border-[#7d7d7d] bg-transparent px-0 pb-1 text-center text-[46px] font-normal tracking-[-0.06em] text-[#2f2f2f] outline-none placeholder:text-[#6f6f6f] md:text-[64px] lg:text-[68px]"
                    />
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <p className="text-[28px] font-normal tracking-[-0.03em] text-[#67748b] md:text-[32px]">
                    Processing submission
                  </p>

                  <div
                    ref={dotsRef}
                    className="mt-7 flex items-center justify-center gap-4"
                  >
                    <span className="h-2 w-2 rounded-full bg-black/25" />
                    <span className="h-2 w-2 rounded-full bg-black/25" />
                    <span className="h-2 w-2 rounded-full bg-black/25" />
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <p className="text-[38px] font-normal tracking-[-0.03em] text-[#2f2f2f] md:text-[42px]">
                    Thank you!
                  </p>
                  <p className="mt-4 text-[24px] font-normal tracking-[-0.02em] text-[#67748b] md:text-[28px]">
                    Proceed for the next step
                  </p>
                </>
              )}
            </div>
          </section>

          <button
            type="button"
            onClick={handleBack}
            aria-label="Back"
            className="absolute bottom-3 left-3 z-20 flex items-center gap-4"
          >
            <div className="relative flex h-8 w-8 rotate-45 items-center justify-center border border-black">
              <span className="absolute -rotate-45 text-[11px] leading-none">
                ◀
              </span>
            </div>
            <span className="text-[12px] uppercase tracking-[0.04em]">
              Back
            </span>
          </button>

          {step === 3 && (
            <button
              type="button"
              onClick={() => router.push("/result")}
              className="absolute bottom-3 right-3 z-20 flex items-center gap-4"
            >
              <span className="text-[12px] uppercase tracking-[0.04em]">
                Proceed
              </span>
              <div className="relative flex h-8 w-8 rotate-45 items-center justify-center border border-black">
                <span className="absolute -rotate-45 text-[11px] leading-none">
                  ▶
                </span>
              </div>
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
