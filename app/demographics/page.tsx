"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type UnknownRecord = Record<string, any>;
type PhaseTwoData = UnknownRecord | null;

type NormalizedDemographics = {
  age: string | null;
  gender: string | null;
  ethnicity: string | null;
  race: string | null;
  raw: UnknownRecord | null;
};

function safeParse(data: string | null): PhaseTwoData {
  if (!data) return null;

  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

function isObject(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toDisplayValue(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }

  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";

  return null;
}

function findFirstValueByKeys(source: unknown, keys: string[]): string | null {
  if (!source) return null;

  if (Array.isArray(source)) {
    for (const item of source) {
      const found = findFirstValueByKeys(item, keys);
      if (found) return found;
    }
    return null;
  }

  if (!isObject(source)) return null;

  for (const [key, value] of Object.entries(source)) {
    const lowerKey = key.toLowerCase();

    if (keys.some((target) => lowerKey.includes(target))) {
      const direct = toDisplayValue(value);
      if (direct) return direct;
    }

    if (isObject(value) || Array.isArray(value)) {
      const nested = findFirstValueByKeys(value, keys);
      if (nested) return nested;
    }
  }

  return null;
}

function findBestDemographicsObject(source: unknown): UnknownRecord | null {
  if (!source) return null;

  if (Array.isArray(source)) {
    for (const item of source) {
      const found = findBestDemographicsObject(item);
      if (found) return found;
    }
    return null;
  }

  if (!isObject(source)) return null;

  const currentKeys = Object.keys(source).map((key) => key.toLowerCase());

  const looksLikeDemographics = currentKeys.some(
    (key) =>
      key.includes("age") ||
      key.includes("gender") ||
      key.includes("ethnicity") ||
      key.includes("race") ||
      key.includes("demographic"),
  );

  if (looksLikeDemographics) return source;

  for (const value of Object.values(source)) {
    if (isObject(value) || Array.isArray(value)) {
      const found = findBestDemographicsObject(value);
      if (found) return found;
    }
  }

  return null;
}

function normalizeDemographics(data: PhaseTwoData): NormalizedDemographics {
  if (!data) {
    return {
      age: null,
      gender: null,
      ethnicity: null,
      race: null,
      raw: null,
    };
  }

  const demographicsObject = findBestDemographicsObject(data);

  return {
    age: findFirstValueByKeys(data, ["age"]),
    gender: findFirstValueByKeys(data, ["gender", "sex"]),
    ethnicity: findFirstValueByKeys(data, ["ethnicity", "ethnic"]),
    race: findFirstValueByKeys(data, ["race"]),
    raw: demographicsObject,
  };
}

export default function DemographicsPage() {
  const router = useRouter();
  const [data, setData] = useState<PhaseTwoData>(null);
  const [activeSection, setActiveSection] = useState("demographics");

  useEffect(() => {
    const stored = safeParse(localStorage.getItem("skinstricPhaseTwoResponse"));
    setData(stored);

    const storedSection = localStorage.getItem("skinstricActiveSection");
    if (
      storedSection === "demographics" ||
      storedSection === "cosmetic" ||
      storedSection === "skin" ||
      storedSection === "weather"
    ) {
      setActiveSection(storedSection);
    }
  }, []);

  const demographics = useMemo(() => normalizeDemographics(data), [data]);

  useEffect(() => {
    localStorage.setItem(
      "skinstricDemographicsData",
      JSON.stringify(demographics),
    );
  }, [demographics]);

  const goBack = () => {
    router.push("/result");
  };

  const goSummary = () => {
    router.push("/demographics/details");
  };

  const goSection = (section: string) => {
    setActiveSection(section);
    localStorage.setItem("skinstricActiveSection", section);

    if (section === "demographics") return;

    if (section === "skin") {
      router.push("/skin-type");
      return;
    }

    if (section === "cosmetic") {
      router.push("/cosmetic-concerns");
      return;
    }

    if (section === "weather") {
      router.push("/weather");
    }
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
            [ ANALYSIS ]
          </div>
        </header>

        <section className="absolute left-[24px] top-[62px] z-20">
          <h1 className="text-[22px] font-semibold uppercase tracking-[-0.01em] text-[#1A1B1C]">
            A. I. ANALYSIS
          </h1>

          <div className="mt-[8px] space-y-[2px] text-[12px] font-normal uppercase leading-[1.35] text-[#1A1B1C]">
            <p>A. I. HAS ESTIMATED THE FOLLOWING.</p>
            <p>FIX ESTIMATED INFORMATION IF NEEDED.</p>
          </div>
        </section>

        <section className="absolute inset-0 flex items-center justify-center">
          <div className="relative h-[620px] w-[620px] translate-x-[6px] translate-y-[8px]">
            <div className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rotate-45 border border-dashed border-[#e3e3e1]" />
            <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rotate-45 border border-dashed border-[#d7d7d6]" />
            <div className="absolute left-1/2 top-1/2 h-[240px] w-[240px] -translate-x-1/2 -translate-y-1/2 rotate-45 border border-dashed border-[#bdbdbb]" />

            <div className="absolute left-1/2 top-1/2 h-[328px] w-[328px] -translate-x-1/2 -translate-y-1/2">
              <button
                type="button"
                onClick={() => goSection("demographics")}
                className={`absolute left-1/2 top-0 flex h-[130px] w-[130px] -translate-x-1/2 rotate-45 items-center justify-center transition-colors duration-200 ${
                  activeSection === "demographics"
                    ? "bg-[#bfc2c7]"
                    : "bg-[#e3e3e6]"
                }`}
              >
                <span className="-rotate-45 text-center text-[16px] font-semibold uppercase leading-[1.1] text-[#111111]">
                  DEMOGRAPHICS
                </span>
              </button>

              <button
                type="button"
                onClick={() => goSection("cosmetic")}
                className={`absolute left-0 top-1/2 flex h-[130px] w-[130px] -translate-y-1/2 rotate-45 items-center justify-center transition-colors duration-200 ${
                  activeSection === "cosmetic" ? "bg-[#bfc2c7]" : "bg-[#e3e3e6]"
                }`}
              >
                <span className="-rotate-45 text-center text-[16px] font-semibold uppercase leading-[1.2] text-[#111111]">
                  COSMETIC
                  <br />
                  CONCERNS
                </span>
              </button>

              <button
                type="button"
                onClick={() => goSection("skin")}
                className={`absolute right-0 top-1/2 flex h-[130px] w-[130px] -translate-y-1/2 rotate-45 items-center justify-center transition-colors duration-200 ${
                  activeSection === "skin" ? "bg-[#bfc2c7]" : "bg-[#e3e3e6]"
                }`}
              >
                <span className="-rotate-45 text-center text-[16px] font-semibold uppercase leading-[1.1] text-[#111111]">
                  SKIN TYPE DETAILS
                </span>
              </button>

              <button
                type="button"
                onClick={() => goSection("weather")}
                className={`absolute bottom-0 left-1/2 flex h-[130px] w-[130px] -translate-x-1/2 rotate-45 items-center justify-center transition-colors duration-200 ${
                  activeSection === "weather" ? "bg-[#bfc2c7]" : "bg-[#e3e3e6]"
                }`}
              >
                <span className="-rotate-45 text-center text-[16px] font-semibold uppercase leading-[1.1] text-[#111111]">
                  WEATHER
                </span>
              </button>
            </div>
          </div>
        </section>

        <footer className="absolute bottom-[22px] left-[24px] right-[24px] flex items-end justify-between">
          <button
            type="button"
            onClick={goBack}
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
            onClick={goSummary}
            className="flex items-center gap-[14px]"
          >
            <span className="text-[12px] font-normal uppercase tracking-[0.02em] text-[#1A1B1C]">
              GET SUMMARY
            </span>
            <div className="relative flex h-[28px] w-[28px] rotate-45 items-center justify-center border border-[#2d2d2d]">
              <span className="absolute -rotate-45 text-[11px] leading-none">
                ▶
              </span>
            </div>
          </button>
        </footer>

        <div className="sr-only" aria-live="polite">
          {demographics.age ? `Age ${demographics.age}. ` : ""}
          {demographics.gender ? `Gender ${demographics.gender}. ` : ""}
          {demographics.ethnicity
            ? `Ethnicity ${demographics.ethnicity}. `
            : ""}
          {demographics.race ? `Race ${demographics.race}. ` : ""}
        </div>
      </div>
    </main>
  );
}
