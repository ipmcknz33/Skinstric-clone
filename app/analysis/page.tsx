"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";

const STORAGE_KEYS = {
  capturedImage: "skinstricCapturedImage",
  phaseTwoResponse: "skinstricPhaseTwoResponse",
  phaseTwoError: "skinstricPhaseTwoError",
};

const PHASE_TWO_URL =
  "https://us-central1-api-skinstric-ai.cloudfunctions.net/skinstricPhaseTwo";

export default function AnalysisPage() {
  const router = useRouter();

  const squareARef = useRef<HTMLDivElement | null>(null);
  const squareBRef = useRef<HTMLDivElement | null>(null);
  const squareCRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const animations: gsap.core.Tween[] = [];

    if (squareARef.current) {
      animations.push(
        gsap.to(squareARef.current, {
          rotate: 360,
          duration: 16,
          repeat: -1,
          ease: "none",
        }),
      );
    }

    if (squareBRef.current) {
      animations.push(
        gsap.to(squareBRef.current, {
          rotate: -360,
          duration: 12,
          repeat: -1,
          ease: "none",
        }),
      );
    }

    if (squareCRef.current) {
      animations.push(
        gsap.to(squareCRef.current, {
          rotate: 360,
          duration: 9,
          repeat: -1,
          ease: "none",
        }),
      );
    }

    return () => {
      animations.forEach((animation) => animation.kill());
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;
    const startedAt = Date.now();

    async function runAnalysis() {
      try {
        localStorage.removeItem(STORAGE_KEYS.phaseTwoError);

        const image = localStorage.getItem(STORAGE_KEYS.capturedImage);

        if (!image) {
          throw new Error("No captured image found.");
        }

        const response = await fetch(PHASE_TWO_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image,
          }),
        });

        const rawText = await response.text();

        let parsed: unknown;
        try {
          parsed = JSON.parse(rawText);
        } catch {
          parsed = { raw: rawText };
        }

        if (!response.ok) {
          const message =
            typeof parsed === "object" &&
            parsed !== null &&
            "message" in parsed &&
            typeof (parsed as { message?: unknown }).message === "string"
              ? (parsed as { message: string }).message
              : "Analysis request failed.";

          throw new Error(message);
        }

        localStorage.setItem(
          STORAGE_KEYS.phaseTwoResponse,
          JSON.stringify(parsed),
        );
      } catch (error) {
        console.error("Skinstric analysis failed:", error);

        localStorage.setItem(
          STORAGE_KEYS.phaseTwoError,
          error instanceof Error ? error.message : "Unknown analysis error.",
        );
      } finally {
        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(0, 3000 - elapsed);

        window.setTimeout(() => {
          if (!isCancelled) {
            router.push("/demographics");
          }
        }, remaining);
      }
    }

    void runAnalysis();

    return () => {
      isCancelled = true;
    };
  }, [router]);

  return (
    <main className="relative h-[100dvh] w-screen overflow-hidden bg-[#f4f4f2]">
      <header className="absolute left-0 top-0 z-20 flex w-full items-start justify-between px-3 py-2">
        <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-black/90">
          Skinstric{" "}
          <span className="ml-2 font-normal text-black/45">[ Analysis ]</span>
        </div>
      </header>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative flex h-[340px] w-[340px] items-center justify-center">
          <div
            ref={squareARef}
            className="absolute h-[190px] w-[190px] rotate-[35deg] border border-dashed border-black/10"
          />
          <div
            ref={squareBRef}
            className="absolute h-[190px] w-[190px] rotate-[8deg] border border-dashed border-black/18"
          />
          <div
            ref={squareCRef}
            className="absolute h-[190px] w-[190px] rotate-[-22deg] border border-dashed border-black/12"
          />

          <p className="relative z-10 text-center text-[12px] font-semibold uppercase tracking-[0.04em] text-black">
            Preparing your analysis ...
          </p>
        </div>
      </div>
    </main>
  );
}
