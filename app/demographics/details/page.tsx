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

type DetailTab = "race" | "age" | "sex";

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

  const orderedRaceList = preferredOrder
    .map((label) => raceList.find((item) => item.label === label))
    .filter(Boolean) as RaceItem[];

  raceList = orderedRaceList.length ? orderedRaceList : fallbackRaceList;

  const topRaceItem =
    [...raceList].sort((a, b) => b.value - a.value)[0] ?? fallbackRaceList[0];

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
    topRace: topRaceItem.label,
    topRacePercent: topRaceItem.value,
    age: ageRaw,
    sex: titleCase(sexRaw),
    raceList,
  };
}

function getTabValue(tab: DetailTab, summary: DemographicSummary): string {
  if (tab === "race") return summary.topRace;
  if (tab === "age") return summary.age;
  return summary.sex;
}

function getTabLabel(tab: DetailTab): string {
  if (tab === "race") return "RACE";
  if (tab === "age") return "AGE";
  return "SEX";
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
  const [activeTab, setActiveTab] = useState<DetailTab>("race");
  const [selectedRaceLabel, setSelectedRaceLabel] = useState<string>("");

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
    const highestRace =
      [...summary.raceList].sort((a, b) => b.value - a.value)[0]?.label ??
      summary.topRace;

    setSelectedRaceLabel((current) =>
      current && summary.raceList.some((item) => item.label === current)
        ? current
        : highestRace,
    );
  }, [summary]);

  useEffect(() => {
    localStorage.setItem("skinstricActiveSection", "demographics");
    localStorage.setItem(
      "skinstricDemographicsSummary",
      JSON.stringify(summary),
    );
  }, [summary]);

  const selectedRace = summary.raceList.find(
    (item) => item.label === selectedRaceLabel,
  ) ??
    [...summary.raceList].sort((a, b) => b.value - a.value)[0] ?? {
      label: summary.topRace,
      value: summary.topRacePercent,
    };

  const displayTitle =
    activeTab === "race"
      ? selectedRace.label.toLowerCase()
      : getTabValue(activeTab, summary).toLowerCase();

  const displayPercent =
    activeTab === "race" ? selectedRace.value : summary.topRacePercent;

  return (
    <main className="relative min-h-screen bg-[#f3f3f1] text-[#1a1a1a]">
      <div className="absolute left-0 top-0 z-50 h-[4px] w-full bg-[#202020]" />

      <div className="relative min-h-screen w-full px-4 pb-[110px] pt-[22px] sm:px-[25px]">
        <header className="flex items-center gap-[10px]">
          <div className="text-[11px] font-semibold uppercase tracking-[0.04em]">
            SKINSTRIC
          </div>
          <div className="text-[11px] uppercase tracking-[0.04em] text-black/45">
            [ ANALYSIS ]
          </div>
        </header>

        <div className="mt-[24px] sm:mt-[32px]">
          <div className="text-[11px] font-semibold uppercase tracking-[0.03em]">
            A. I. ANALYSIS
          </div>

          <div className="mt-[6px] flex flex-wrap items-start gap-[12px] sm:gap-[16px]">
            <h1 className="text-[40px] font-light uppercase leading-none tracking-[-0.06em] text-[#202020] sm:text-[52px] lg:text-[62px]">
              DEMOGRAPHICS
            </h1>

            <div className="flex gap-[10px] pt-[4px] sm:pt-[6px]">
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

        <section className="mt-[26px] grid grid-cols-1 gap-[12px] lg:mt-[34px] lg:grid-cols-[140px_1fr_298px]">
          <div className="grid grid-cols-1 gap-[6px] sm:grid-cols-3 lg:flex lg:flex-col">
            {(["race", "age", "sex"] as DetailTab[]).map((tab) => {
              const active = activeTab === tab;
              const isRace = tab === "race";

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`flex h-[68px] flex-col items-start justify-between px-[12px] py-[10px] text-left transition-colors ${
                    active
                      ? "bg-[#141519] text-white"
                      : isRace
                        ? "bg-[#d7d7d8] text-[#1a1a1a]"
                        : tab === "age"
                          ? "bg-[#cfcfd1] text-[#1a1a1a]"
                          : "bg-[#e2e2e3] text-[#1a1a1a]"
                  }`}
                >
                  <div className="text-[18px] font-medium uppercase leading-none">
                    {getTabValue(tab, summary)}
                  </div>
                  <div
                    className={`text-[12px] uppercase tracking-[0.02em] ${
                      active ? "text-white/90" : "text-black/80"
                    }`}
                  >
                    {getTabLabel(tab)}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="relative min-h-[340px] border-t border-t-black/40 bg-[#efefef] sm:min-h-[380px] lg:min-h-0">
            <div className="absolute left-[10px] top-[10px] pr-[10px] text-[22px] font-normal tracking-[-0.04em] text-[#232323] sm:text-[26px]">
              {displayTitle}
            </div>

            <div className="absolute bottom-[16px] right-1/2 flex h-[210px] w-[210px] translate-x-1/2 items-center justify-center rounded-full border-[3px] border-[#1f1f1f] sm:h-[240px] sm:w-[240px] lg:right-[12px] lg:translate-x-0 lg:h-[258px] lg:w-[258px]">
              <div className="text-[42px] font-light tracking-[-0.05em] text-[#242424] sm:text-[48px] lg:text-[52px]">
                {displayPercent}
                <span className="relative -top-[12px] ml-[2px] text-[18px] sm:-top-[14px] sm:text-[20px] lg:-top-[16px] lg:text-[22px]">
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
              {summary.raceList.map((item) => {
                const selected = selectedRace.label === item.label;

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setSelectedRaceLabel(item.label);
                      setActiveTab("race");
                    }}
                    className={`flex w-full items-center justify-between px-[10px] py-[9px] text-left text-[14px] transition-colors ${
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
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <div className="mt-[18px] flex flex-col items-center gap-[14px] sm:mt-[22px] lg:absolute lg:bottom-[28px] lg:left-[25px] lg:right-[25px] lg:mt-0 lg:flex-row lg:items-end lg:justify-between">
          <button
            type="button"
            onClick={() => router.push("/demographics")}
            className="order-2 flex items-center gap-[14px] lg:order-1"
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

          <div className="order-1 text-center text-[12px] text-black/30 lg:order-2">
            If A.I. estimate is wrong, select the correct one.
          </div>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="order-3 flex items-center gap-[14px]"
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
