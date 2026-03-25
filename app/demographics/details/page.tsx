"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type UnknownRecord = Record<string, any>;
type PhaseTwoData = UnknownRecord | null;

type RaceItem = {
  label: string;
  value: number;
};

type DemographicSummary = {
  topRace: string;
  topRacePercent: number;
  age: string;
  sex: string;
  raceList: RaceItem[];
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

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string") {
    const cleaned = value.replace("%", "").trim();
    const parsed = Number(cleaned);
    if (Number.isFinite(parsed)) return parsed;
  }

  return null;
}

function toText(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return null;
}

function titleCase(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function keyMatchesTarget(key: string, targets: string[]): boolean {
  const normalized = normalizeKey(key);
  return targets.some((target) => normalized === normalizeKey(target));
}

function findFirstTextByExactKeys(
  source: unknown,
  keys: string[],
): string | null {
  if (Array.isArray(source)) {
    for (const item of source) {
      const found = findFirstTextByExactKeys(item, keys);
      if (found) return found;
    }
    return null;
  }

  if (!isObject(source)) return null;

  for (const [key, value] of Object.entries(source)) {
    if (keyMatchesTarget(key, keys)) {
      const direct = toText(value);
      if (direct) return direct;
    }

    if (isObject(value) || Array.isArray(value)) {
      const nested = findFirstTextByExactKeys(value, keys);
      if (nested) return nested;
    }
  }

  return null;
}

function convertConfidenceToPercent(value: number): number {
  if (value <= 1) return Math.round(value * 100);
  return Math.round(value);
}

function findRaceMap(source: unknown): Record<string, number> | null {
  if (Array.isArray(source)) {
    for (const item of source) {
      const found = findRaceMap(item);
      if (found) return found;
    }
    return null;
  }

  if (!isObject(source)) return null;

  const loweredKeys = Object.keys(source).map((key) => key.toLowerCase());
  const looksLikeRaceBucket =
    loweredKeys.some((key) => key.includes("race")) ||
    loweredKeys.some((key) => key.includes("ethnicity"));

  if (looksLikeRaceBucket) {
    for (const value of Object.values(source)) {
      if (!isObject(value)) continue;

      const candidateEntries = Object.entries(value)
        .map(([label, raw]) => {
          const num = toNumber(raw);
          return num === null ? null : ([label, num] as const);
        })
        .filter(Boolean) as Array<readonly [string, number]>;

      if (candidateEntries.length >= 2) {
        return Object.fromEntries(candidateEntries);
      }
    }
  }

  const directEntries = Object.entries(source)
    .map(([label, raw]) => {
      const num = toNumber(raw);
      return num === null ? null : ([label, num] as const);
    })
    .filter(Boolean) as Array<readonly [string, number]>;

  const nonGenericDirectEntries = directEntries.filter(([label]) => {
    const lower = label.toLowerCase();
    return (
      !lower.includes("age") &&
      !lower.includes("gender") &&
      !lower.includes("sex") &&
      !lower.includes("confidence") &&
      !lower.includes("message") &&
      !lower.includes("status")
    );
  });

  if (nonGenericDirectEntries.length >= 4) {
    return Object.fromEntries(nonGenericDirectEntries);
  }

  for (const value of Object.values(source)) {
    if (isObject(value) || Array.isArray(value)) {
      const found = findRaceMap(value);
      if (found) return found;
    }
  }

  return null;
}

function normalizeRaceLabel(label: string): string {
  const lower = label.toLowerCase().trim();

  const labelMap: Record<string, string> = {
    eastasian: "East Asian",
    "east asian": "East Asian",
    white: "White",
    black: "Black",
    southasian: "South Asian",
    "south asian": "South Asian",
    latinohispanic: "Latino Hispanic",
    "latino hispanic": "Latino Hispanic",
    southeastasian: "South East Asain",
    "south east asian": "South East Asain",
    southeastasain: "South East Asain",
    "south east asain": "South East Asain",
    middleeastern: "Middle Eastern",
    "middle eastern": "Middle Eastern",
  };

  return labelMap[lower] ?? titleCase(label);
}

function buildSummary(data: PhaseTwoData): DemographicSummary {
  const fallbackRaceList: RaceItem[] = [
    { label: "East Asian", value: 96 },
    { label: "White", value: 6 },
    { label: "Black", value: 3 },
    { label: "South Asian", value: 2 },
    { label: "Latino Hispanic", value: 0 },
    { label: "South East Asain", value: 0 },
    { label: "Middle Eastern", value: 0 },
  ];

  const raceMap = findRaceMap(data);

  let raceList =
    raceMap && Object.keys(raceMap).length
      ? Object.entries(raceMap)
          .map(([label, value]) => ({
            label: normalizeRaceLabel(label),
            value: convertConfidenceToPercent(value),
          }))
          .sort((a, b) => b.value - a.value)
      : fallbackRaceList;

  const preferredOrder = [
    "East Asian",
    "White",
    "Black",
    "South Asian",
    "Latino Hispanic",
    "South East Asain",
    "Middle Eastern",
  ];

  raceList = preferredOrder
    .map((label) => raceList.find((item) => item.label === label))
    .filter(Boolean) as RaceItem[];

  if (!raceList.length) {
    raceList = fallbackRaceList;
  }

  const topRace = raceList[0]?.label ?? "East Asian";
  const topRacePercent = raceList[0]?.value ?? 96;

  const fallbackAge =
    typeof window !== "undefined"
      ? window.localStorage.getItem("skinstricDerivedAge")
      : null;

  const fallbackSex =
    typeof window !== "undefined"
      ? window.localStorage.getItem("skinstricDerivedSex")
      : null;

  const ageRaw =
    findFirstTextByExactKeys(data, ["age", "ageRange", "agerange"]) ??
    fallbackAge ??
    "20-29";

  const sexRaw =
    findFirstTextByExactKeys(data, ["gender", "sex"]) ??
    fallbackSex ??
    "Female";

  return {
    topRace,
    topRacePercent,
    age: ageRaw,
    sex: titleCase(sexRaw),
    raceList,
  };
}

export default function DemographicsDetailsPage() {
  const router = useRouter();
  const [phaseTwoData, setPhaseTwoData] = useState<PhaseTwoData>(null);
  const [summary, setSummary] = useState<DemographicSummary>({
    topRace: "East Asian",
    topRacePercent: 96,
    age: "20-29",
    sex: "Female",
    raceList: [
      { label: "East Asian", value: 96 },
      { label: "White", value: 6 },
      { label: "Black", value: 3 },
      { label: "South Asian", value: 2 },
      { label: "Latino Hispanic", value: 0 },
      { label: "South East Asain", value: 0 },
      { label: "Middle Eastern", value: 0 },
    ],
  });

  useEffect(() => {
    setPhaseTwoData(
      safeParse(localStorage.getItem("skinstricPhaseTwoResponse")),
    );
  }, []);

  const derivedSummary = useMemo(
    () => buildSummary(phaseTwoData),
    [phaseTwoData],
  );

  useEffect(() => {
    setSummary(derivedSummary);
  }, [derivedSummary]);

  useEffect(() => {
    localStorage.setItem("skinstricActiveSection", "demographics");
    localStorage.setItem(
      "skinstricDemographicsSummary",
      JSON.stringify(summary),
    );
  }, [summary]);

  const handleReset = () => {
    setSummary(derivedSummary);
  };

  const handleConfirm = () => {
    localStorage.setItem(
      "skinstricDemographicsConfirmed",
      JSON.stringify(summary),
    );
    router.push("/summary-processing");
  };

  return (
    <main className="relative h-screen overflow-hidden bg-[#f3f3f1] text-[#1a1a1a]">
      <div className="absolute left-0 top-0 z-50 h-[4px] w-full bg-[#202020]" />

      <div className="relative h-full w-full px-[25px] pt-[22px]">
        <header className="flex items-center gap-[10px]">
          <div className="text-[11px] font-semibold uppercase tracking-[0.04em]">
            SKINSTRIC
          </div>
          <div className="text-[11px] uppercase tracking-[0.04em] text-black/45">
            [ ANALYSIS ]
          </div>
        </header>

        <div className="absolute left-[25px] top-[58px]">
          <div className="text-[11px] font-semibold uppercase tracking-[0.03em]">
            A. I. ANALYSIS
          </div>

          <div className="mt-[6px] flex items-start gap-[16px]">
            <h1 className="text-[62px] font-light uppercase leading-none tracking-[-0.06em] text-[#202020]">
              DEMOGRAPHICS
            </h1>

            <div className="flex gap-[10px] pt-[6px]">
              <button
                type="button"
                onClick={() => router.push("/demographics")}
                className="relative flex h-[28px] w-[28px] rotate-45 items-center justify-center border border-[#2a2a2a]"
                aria-label="Back to demographics selector"
              >
                <span className="absolute -rotate-45 text-[12px] leading-none">
                  ◀
                </span>
              </button>

              <button
                type="button"
                onClick={() => router.push("/skin-type")}
                className="relative flex h-[28px] w-[28px] rotate-45 items-center justify-center border border-[#2a2a2a]"
                aria-label="Next section"
              >
                <span className="absolute -rotate-45 text-[12px] leading-none">
                  ▶
                </span>
              </button>
            </div>
          </div>

          <div className="mt-[8px] text-[12px] uppercase tracking-[0.01em] text-black/70">
            PREDICTED RACE &amp; AGE
          </div>
        </div>

        <section className="absolute left-[25px] right-[25px] top-[205px] bottom-[74px] grid grid-cols-[140px_1fr_298px] gap-[12px]">
          <div className="flex flex-col gap-[6px]">
            <button
              type="button"
              className="flex h-[68px] flex-col items-start justify-between bg-[#141519] px-[12px] py-[10px] text-left text-white"
            >
              <div className="text-[18px] font-medium uppercase leading-none">
                {summary.topRace}
              </div>
              <div className="text-[12px] uppercase tracking-[0.02em] text-white/90">
                RACE
              </div>
            </button>

            <button
              type="button"
              className="flex h-[68px] flex-col items-start justify-between bg-[#cfcfd1] px-[12px] py-[10px] text-left text-[#1a1a1a]"
            >
              <div className="text-[18px] font-medium uppercase leading-none">
                {summary.age}
              </div>
              <div className="text-[12px] uppercase tracking-[0.02em] text-black/80">
                AGE
              </div>
            </button>

            <button
              type="button"
              className="flex h-[68px] flex-col items-start justify-between bg-[#e2e2e3] px-[12px] py-[10px] text-left text-[#1a1a1a]"
            >
              <div className="text-[18px] font-medium uppercase leading-none">
                {summary.sex}
              </div>
              <div className="text-[12px] uppercase tracking-[0.02em] text-black/80">
                SEX
              </div>
            </button>
          </div>

          <div className="relative border-t border-t-black/40 bg-[#efefef]">
            <div className="absolute left-[10px] top-[10px] text-[26px] font-normal tracking-[-0.04em] text-[#232323]">
              {summary.topRace.toLowerCase()}
            </div>

            <div className="absolute bottom-[16px] right-[12px] flex h-[258px] w-[258px] items-center justify-center rounded-full border-[3px] border-[#1f1f1f]">
              <div className="text-[52px] font-light tracking-[-0.05em] text-[#242424]">
                {summary.topRacePercent}
                <span className="relative -top-[16px] ml-[2px] text-[22px]">
                  %
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-t-black/40 bg-[#efefef]">
            <div className="flex items-center justify-between px-[10px] pb-[8px] pt-[10px] text-[12px] uppercase tracking-[0.02em] text-black/75">
              <span>RACE</span>
              <span>A. I. CONFIDENCE</span>
            </div>

            <div className="space-y-[2px]">
              {summary.raceList.map((item, index) => {
                const selected = index === 0;

                return (
                  <div
                    key={item.label}
                    className={`flex items-center justify-between px-[10px] py-[9px] text-[14px] ${
                      selected ? "bg-[#15161a] text-white" : "text-[#242424]"
                    }`}
                  >
                    <div className="flex items-center gap-[10px]">
                      <span className="text-[11px]">
                        {selected ? "◈" : "◇"}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    <span>{item.value} %</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <div className="absolute bottom-[28px] left-[25px] right-[25px] flex items-end justify-between">
          {/* BACK */}
          <button
            type="button"
            onClick={() => router.push("/demographics")}
            className="flex items-center gap-[14px]"
          >
            <div className="relative flex h-[28px] w-[28px] rotate-45 items-center justify-center border border-[#2d2d2d]">
              <span className="absolute -rotate-45 text-[11px] leading-none">
                ◀
              </span>
            </div>
            <span className="text-[12px] uppercase tracking-[0.02em]">
              BACK
            </span>
          </button>

          {/* CENTER TEXT */}
          <div className="absolute left-1/2 top-[2px] -translate-x-1/2 text-[12px] text-black/30">
            If A.I. estimate is wrong, select the correct one.
          </div>

          {/* HOME (replaces RESET + CONFIRM) */}
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex items-center gap-[14px]"
          >
            <div className="relative flex h-[28px] w-[28px] rotate-45 items-center justify-center border border-[#2d2d2d]">
              <span className="absolute -rotate-45 text-[11px] leading-none">
                ▶
              </span>
            </div>
            <span className="text-[12px] uppercase tracking-[0.02em]">
              HOME
            </span>
          </button>
        </div>
      </div>
    </main>
  );
}
