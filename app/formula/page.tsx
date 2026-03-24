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

function getConcernCopy(label: string, age: string) {
  const map: Record<
    string,
    {
      detected: string[];
      skinTraits: string[];
    }
  > = {
    "CLOGGED PORES": {
      detected: ["CLOGGED PORES", "UNEVEN TEXTURE", "CONGESTION"],
      skinTraits: ["OILY", "DEHYDRATED"],
    },
    "OILY SKIN": {
      detected: ["SHINE BUILDUP", "VISIBLE PORES", "SEBUM IMBALANCE"],
      skinTraits: ["OILY", "SENSITIVE"],
    },
    WRINKLING: {
      detected: ["CROW'S FEET WRINKLES", "FINE LINES", "TEXTURE LOSS"],
      skinTraits: ["DRY", "DEHYDRATED"],
    },
    "A.I. SUGGESTIONS": {
      detected: ["GENERAL SKIN STRESS", "TEXTURE CHANGES", "FOCUS AREAS"],
      skinTraits: ["COMBINATION", "TIRED"],
    },
  };

  return {
    age,
    ...(map[label] ?? map["CLOGGED PORES"]),
  };
}

export default function FormulaPage() {
  const router = useRouter();

  const [selectedConcerns, setSelectedConcerns] = useState<SummaryConcern[]>([
    { label: "CLOGGED PORES", active: true },
    { label: "OILY SKIN" },
    { label: "WRINKLING" },
    { label: "A.I. SUGGESTIONS" },
  ]);

  const [focusedConcern, setFocusedConcern] = useState("CLOGGED PORES");
  const [confirmedSummary, setConfirmedSummary] = useState<DemographicSummary>({
    topRace: "East Asian",
    age: "20-29",
    sex: "Female",
  });

  useEffect(() => {
    const concerns = safeParse<SummaryConcern[]>(
      localStorage.getItem("skinstricSummaryConcerns"),
      [
        { label: "CLOGGED PORES", active: true },
        { label: "OILY SKIN" },
        { label: "WRINKLING" },
        { label: "A.I. SUGGESTIONS" },
      ],
    );

    const focused =
      localStorage.getItem("skinstricFocusedConcern") ?? "CLOGGED PORES";

    const demo = safeParse<DemographicSummary>(
      localStorage.getItem("skinstricDemographicsConfirmed"),
      {
        topRace: "East Asian",
        age: "20-29",
        sex: "Female",
      },
    );

    setSelectedConcerns(concerns);
    setFocusedConcern(focused);
    setConfirmedSummary(demo);
  }, []);

  const info = useMemo(
    () => getConcernCopy(focusedConcern, confirmedSummary.age ?? "20-29"),
    [focusedConcern, confirmedSummary.age],
  );

  const handleSelectConcern = (label: string) => {
    setFocusedConcern(label);
    localStorage.setItem("skinstricFocusedConcern", label);
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
            A. I. ESTIMATE
          </h1>

          <div className="mt-[2px] text-[62px] font-light uppercase leading-none tracking-[-0.06em] text-[#202020]">
            SUMMARY
          </div>

          <div className="mt-[10px] max-w-[250px] space-y-[2px] text-[12px] leading-[1.45] text-black/55">
            <p>Based on the conditional logic A.I. recomends</p>
            <p>to focus on the following concerns</p>
          </div>
        </section>

        <section className="absolute left-[24px] top-[207px] h-[368px] w-[287px] border-t border-black/40 bg-[#efefef] px-[10px] py-[12px]">
          <div className="text-[18px] font-medium uppercase leading-none">
            {focusedConcern}
          </div>

          <div className="mt-[86px] text-[14px] font-medium text-[#1d1d1d]">
            You are getting this concern because
          </div>

          <div className="mt-[18px] text-[12px] text-black/65">
            Your age group is
          </div>
          <div className="mt-[6px] text-[22px] font-medium uppercase">
            {info.age}
          </div>

          <div className="mt-[18px] text-[12px] text-black/65">
            A.I. has detected
          </div>
          <div className="mt-[8px] space-y-[8px] text-[18px] font-medium uppercase leading-none">
            {info.detected.map((item) => (
              <div key={item}>{item}</div>
            ))}
          </div>

          <div className="mt-[18px] text-[12px] text-black/65">
            Your skin is
          </div>
          <div className="mt-[8px] flex gap-[22px] text-[18px] font-medium uppercase leading-none">
            {info.skinTraits.map((item) => (
              <div key={item}>{item}</div>
            ))}
          </div>

          <div className="absolute bottom-[10px] right-[10px] text-[12px] uppercase">
            FOCUS
          </div>
        </section>

        <section className="absolute left-[351px] top-[239px]">
          <div className="relative h-[328px] w-[328px]">
            <button
              type="button"
              onClick={() => handleSelectConcern("CLOGGED PORES")}
              className={`absolute left-1/2 top-0 flex h-[130px] w-[130px] -translate-x-1/2 rotate-45 items-center justify-center transition-colors duration-200 ${
                focusedConcern === "CLOGGED PORES"
                  ? "bg-[#141519] text-white"
                  : "bg-[#e3e3e6]"
              }`}
            >
              <span className="-rotate-45 text-center text-[16px] font-medium uppercase leading-[1.1]">
                CLOGGED PORES
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectConcern("OILY SKIN")}
              className={`absolute left-0 top-1/2 flex h-[130px] w-[130px] -translate-y-1/2 rotate-45 items-center justify-center transition-colors duration-200 ${
                focusedConcern === "OILY SKIN"
                  ? "bg-[#141519] text-white"
                  : "bg-[#e3e3e6]"
              }`}
            >
              <span className="-rotate-45 text-center text-[16px] font-medium uppercase leading-[1.1]">
                OILY SKIN
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectConcern("A.I. SUGGESTIONS")}
              className={`absolute right-0 top-1/2 flex h-[130px] w-[130px] -translate-y-1/2 rotate-45 items-center justify-center transition-colors duration-200 ${
                focusedConcern === "A.I. SUGGESTIONS"
                  ? "bg-[#141519] text-white"
                  : "bg-[#efefef] text-black/35"
              }`}
            >
              <span className="-rotate-45 text-center text-[16px] font-medium uppercase leading-[1.1]">
                A.I. SUGGESTIONS
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectConcern("WRINKLING")}
              className={`absolute bottom-0 left-1/2 flex h-[130px] w-[130px] -translate-x-1/2 rotate-45 items-center justify-center transition-colors duration-200 ${
                focusedConcern === "WRINKLING"
                  ? "bg-[#141519] text-white"
                  : "bg-[#e3e3e6]"
              }`}
            >
              <span className="-rotate-45 text-center text-[16px] font-medium uppercase leading-[1.1]">
                WRINKLING
              </span>
            </button>
          </div>
        </section>

        <section className="absolute left-[698px] top-[357px]">
          <h2 className="text-[33px] font-medium uppercase tracking-[-0.04em] text-[#202020]">
            I WANT TO FOCUS ON
          </h2>
          <p className="mt-[8px] text-[16px] text-black/45">
            Select or deselect concerns
          </p>
        </section>

        <section className="absolute right-[267px] top-[313px]">
          <div className="relative flex h-[145px] w-[145px] rotate-45 items-center justify-center border border-dashed border-[#cfcfcf]">
            <div className="-rotate-45 text-center">
              <div className="text-[30px] font-light leading-none">7</div>
              <div className="mt-[10px] text-[14px] font-medium uppercase leading-[1.2]">
                HAVEN&apos;T FOUND
                <br />
                YOURS?
              </div>
            </div>
          </div>
        </section>

        <footer className="absolute bottom-[22px] left-[24px] right-[24px] flex items-end justify-between">
          <button
            type="button"
            onClick={() => router.push("/summary")}
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
            onClick={() => router.push("/routine")}
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
          Focused concern is {focusedConcern}. Confirmed demographics include{" "}
          {confirmedSummary.topRace}, age {confirmedSummary.age}, sex{" "}
          {confirmedSummary.sex}.
        </div>
      </div>
    </main>
  );
}
