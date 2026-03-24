"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type SummaryConcern = {
  label: string;
  active?: boolean;
};

type DemographicSummary = {
  topRace?: string;
  topRacePercent?: number;
  age?: string;
  sex?: string;
};

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export default function SummaryPage() {
  const router = useRouter();

  const [selectedConcerns, setSelectedConcerns] = useState<SummaryConcern[]>([
    { label: "CLOGGED PORES", active: true },
    { label: "OILY SKIN" },
    { label: "WRINKLING" },
    { label: "A.I. SUGGESTIONS" },
  ]);

  const [confirmedSummary, setConfirmedSummary] = useState<DemographicSummary>({
    topRace: "East Asian",
    topRacePercent: 96,
    age: "20-29",
    sex: "Female",
  });

  useEffect(() => {
    const stored = safeParse<DemographicSummary>(
      localStorage.getItem("skinstricDemographicsConfirmed"),
      {
        topRace: "East Asian",
        topRacePercent: 96,
        age: "20-29",
        sex: "Female",
      },
    );

    setConfirmedSummary(stored);
  }, []);

  const selectedCount = useMemo(
    () => selectedConcerns.filter((item) => item.active).length,
    [selectedConcerns],
  );

  const activeConcern = useMemo(
    () =>
      selectedConcerns.find(
        (item) => item.active && item.label !== "A.I. SUGGESTIONS",
      )?.label ?? "CLOGGED PORES",
    [selectedConcerns],
  );

  const toggleConcern = (label: string) => {
    setSelectedConcerns((current) =>
      current.map((item) =>
        item.label === label ? { ...item, active: !item.active } : item,
      ),
    );
  };

  const handleGetFormula = () => {
    localStorage.setItem(
      "skinstricSummaryConcerns",
      JSON.stringify(selectedConcerns),
    );
    localStorage.setItem("skinstricFocusedConcern", activeConcern);
    router.push("/formula");
  };

  return (
    <main className="relative h-screen overflow-hidden bg-[#f4f4f2] text-[#1A1B1C]">
      <div className="absolute left-0 top-0 z-50 h-[4px] w-full bg-[#222222]" />

      <div className="relative h-full w-full">
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

          <div className="mt-[2px] text-[62px] font-light uppercase leading-none tracking-[-0.06em] text-[#202020]">
            SUMMARY
          </div>

          <div className="mt-[10px] max-w-[250px] space-y-[2px] text-[12px] leading-[1.45] text-black/55">
            <p>Based on the conditional logic A.I. recomends</p>
            <p>to focus on the following concerns</p>
          </div>
        </section>

        <section className="absolute left-[245px] top-[238px]">
          <div className="relative h-[328px] w-[328px]">
            <button
              type="button"
              onClick={() => toggleConcern("CLOGGED PORES")}
              className={`absolute left-1/2 top-0 flex h-[130px] w-[130px] -translate-x-1/2 rotate-45 items-center justify-center border transition-colors duration-200 ${
                selectedConcerns.find((item) => item.label === "CLOGGED PORES")
                  ?.active
                  ? "border-[#222222] bg-[#efefef]"
                  : "border-transparent bg-[#e3e3e6]"
              }`}
            >
              <span className="-rotate-45 text-center text-[16px] font-medium uppercase leading-[1.1]">
                CLOGGED PORES
              </span>
            </button>

            <button
              type="button"
              onClick={() => toggleConcern("OILY SKIN")}
              className={`absolute left-0 top-1/2 flex h-[130px] w-[130px] -translate-y-1/2 rotate-45 items-center justify-center transition-colors duration-200 ${
                selectedConcerns.find((item) => item.label === "OILY SKIN")
                  ?.active
                  ? "bg-[#bfc2c7]"
                  : "bg-[#e3e3e6]"
              }`}
            >
              <span className="-rotate-45 text-center text-[16px] font-medium uppercase leading-[1.1]">
                OILY SKIN
              </span>
            </button>

            <button
              type="button"
              onClick={() => toggleConcern("A.I. SUGGESTIONS")}
              className={`absolute right-0 top-1/2 flex h-[130px] w-[130px] -translate-y-1/2 rotate-45 items-center justify-center transition-colors duration-200 ${
                selectedConcerns.find(
                  (item) => item.label === "A.I. SUGGESTIONS",
                )?.active
                  ? "bg-[#bfc2c7]"
                  : "bg-[#efefef]"
              }`}
            >
              <span className="-rotate-45 text-center text-[16px] font-medium uppercase leading-[1.1] text-black/35">
                A.I. SUGGESTIONS
              </span>
            </button>

            <button
              type="button"
              onClick={() => toggleConcern("WRINKLING")}
              className={`absolute bottom-0 left-1/2 flex h-[130px] w-[130px] -translate-x-1/2 rotate-45 items-center justify-center transition-colors duration-200 ${
                selectedConcerns.find((item) => item.label === "WRINKLING")
                  ?.active
                  ? "bg-[#bfc2c7]"
                  : "bg-[#e3e3e6]"
              }`}
            >
              <span className="-rotate-45 text-center text-[16px] font-medium uppercase leading-[1.1]">
                WRINKLING
              </span>
            </button>
          </div>
        </section>

        <section className="absolute left-[593px] top-[357px]">
          <h2 className="text-[33px] font-medium uppercase tracking-[-0.04em] text-[#202020]">
            I WANT TO FOCUS ON
          </h2>
          <p className="mt-[8px] text-[16px] text-black/45">
            Select or deselect concerns
          </p>
        </section>

        <section className="absolute right-[350px] top-[313px]">
          <div className="relative flex h-[145px] w-[145px] rotate-45 items-center justify-center border border-dashed border-[#cfcfcf]">
            <div className="-rotate-45 text-center">
              <div className="text-[30px] font-light leading-none">
                {selectedCount}
              </div>
              <div className="mt-[10px] text-[14px] font-medium uppercase leading-[1.2]">
                HAVEN&apos;T FOUND
                <br />
                YOURS?
              </div>
            </div>
          </div>
        </section>

        <section className="absolute right-[484px] bottom-[54px] text-center">
          <div className="relative mx-auto flex h-[34px] w-[34px] rotate-45 items-center justify-center border border-[#d3d3d3]">
            <span className="-rotate-45 text-[12px] text-[#9a9a9a]">+</span>
          </div>
          <p className="mt-[10px] text-[11px] uppercase leading-[1.25] tracking-[0.02em] text-black/30">
            TAP CONCERN
            <br />
            TO FIND OUT MORE
          </p>
        </section>

        <footer className="absolute bottom-[22px] left-[24px] right-[24px] flex items-end justify-between">
          <button
            type="button"
            onClick={() => router.push("/demographics/details")}
            className="flex items-center gap-[14px]"
          >
            <div className="relative flex h-[28px] w-[28px] rotate-45 items-center justify-center border border-[#2d2d2d]">
              <span className="absolute -rotate-45 text-[11px] leading-none">
                ◀
              </span>
            </div>
            <span className="text-[12px] font-normal uppercase tracking-[0.02em] text-[#1A1B1C]">
              BACK
            </span>
          </button>

          <button
            type="button"
            onClick={handleGetFormula}
            className="flex items-center gap-[14px]"
          >
            <span className="text-[12px] font-normal uppercase tracking-[0.02em] text-[#1A1B1C]">
              GET FORMULA
            </span>
            <div className="relative flex h-[28px] w-[28px] rotate-45 items-center justify-center border border-[#2d2d2d]">
              <span className="absolute -rotate-45 text-[11px] leading-none">
                ▶
              </span>
            </div>
          </button>
        </footer>

        <div className="sr-only" aria-live="polite">
          Confirmed demographics: {confirmedSummary.topRace}, age{" "}
          {confirmedSummary.age}, sex {confirmedSummary.sex}.
        </div>
      </div>
    </main>
  );
}
