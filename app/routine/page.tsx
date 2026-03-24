"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ConcernItem = {
  id: string;
  label: string;
  tone?: "dark" | "light" | "ghost" | "dotted";
  description: string;
};

const CONCERNS: ConcernItem[] = [
  {
    id: "dark-circles",
    label: "DARK CIRCLES",
    tone: "dark",
    description:
      "Periocular discoloration refers to undereye darkening, typically due to poor circulation. Laser treatment paired with skin stimulants such as Vitamin K is most effective.",
  },
  {
    id: "signs-of-aging",
    label: "SIGNS OF AGING",
    tone: "light",
    description:
      "Fine lines, laxity, and volume loss can become more visible over time. A routine focused on hydration, collagen support, and barrier repair helps improve overall skin resilience.",
  },
  {
    id: "dullness",
    label: "DULLNESS/\nLUCKLUSTER\nTONE",
    tone: "ghost",
    description:
      "Dullness is commonly linked to dehydration and uneven surface turnover. Brightening actives and gentle resurfacing can help restore a healthier, more luminous appearance.",
  },
  {
    id: "custom",
    label: "?\nHAVEN'T FOUND\nYOURS?",
    tone: "dotted",
    description:
      "If your concern is not listed, choose the closest match and continue. Your routine can still be adjusted later based on your selected goals.",
  },
  {
    id: "sun-damage-1",
    label: "SUN DAMAGE",
    tone: "ghost",
    description:
      "Sun damage often shows up as pigmentation, uneven tone, and premature aging. Consistent SPF and restorative support are essential for long-term correction.",
  },
  {
    id: "uneven-skin-tone",
    label: "UNEVEN SKIN TONE",
    tone: "ghost",
    description:
      "Uneven skin tone can result from post-inflammatory marks, UV exposure, or surface buildup. Brightening support and skin turnover management are commonly recommended.",
  },
  {
    id: "dryness",
    label: "DRYNESS/\nDEHYDRATION",
    tone: "ghost",
    description:
      "Dryness and dehydration can make skin appear flat, tight, or textured. Barrier-first care with humectants and lipid support usually helps improve comfort and bounce.",
  },
  {
    id: "textural-irregularities",
    label: "TEXTURAL\nIRREGULARITIES",
    tone: "ghost",
    description:
      "Texture concerns can include roughness, enlarged pores, or bumpy skin. Smoother-looking skin usually comes from steady exfoliation balance and barrier support.",
  },
  {
    id: "sun-damage-2",
    label: "SUN DAMAGE",
    tone: "ghost",
    description:
      "Repeated UV exposure contributes to pigmentation changes and visible aging. Protective and repairing steps are the foundation of correction.",
  },
];

function Diamond({
  item,
  selected,
  onClick,
}: {
  item: ConcernItem;
  selected: boolean;
  onClick: () => void;
}) {
  const base =
    "absolute flex h-[114px] w-[114px] -translate-x-1/2 -translate-y-1/2 rotate-45 items-center justify-center border transition-all duration-200";
  const inner =
    "pointer-events-none flex h-full w-full -rotate-45 items-center justify-center px-2 text-center text-[13px] font-semibold leading-[1.2] tracking-[-0.01em]";

  let toneClass =
    "border-black/10 bg-[#efefef] text-black/80 hover:border-black/25";

  if (item.tone === "dark") {
    toneClass = selected
      ? "border-[#111216] bg-[#111216] text-white"
      : "border-black/10 bg-[#efefef] text-black/80 hover:border-black/25";
  }

  if (item.tone === "light") {
    toneClass = selected
      ? "border-[#111216] bg-[#111216] text-white"
      : "border-black/45 bg-transparent text-black";
  }

  if (item.tone === "ghost") {
    toneClass = selected
      ? "border-[#111216] bg-[#111216] text-white"
      : "border-transparent bg-[#ececeb] text-black/85";
  }

  if (item.tone === "dotted") {
    toneClass = selected
      ? "border-[#111216] bg-[#111216] text-white"
      : "border border-dashed border-black/20 bg-transparent text-black";
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${toneClass}`}
      aria-pressed={selected}
    >
      <div className={inner}>
        <span className="whitespace-pre-line">{item.label}</span>
      </div>
    </button>
  );
}
function NavDiamond({
  direction,
  onClick,
}: {
  direction: "left" | "right";
  onClick: () => void;
}) {
  const arrow = direction === "left" ? "◀" : "▶";

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex h-[26px] w-[26px] rotate-45 items-center justify-center border border-black/70 bg-transparent transition-transform duration-200 hover:scale-105"
      aria-label={direction === "left" ? "Back" : "Continue"}
    >
      <span className="-rotate-45 text-[12px] leading-none text-black">
        {arrow}
      </span>
    </button>
  );
}

export default function RoutineBuilderPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string>("dark-circles");

  const selectedConcern = useMemo(
    () => CONCERNS.find((item) => item.id === selectedId) ?? CONCERNS[0],
    [selectedId],
  );

  const positions = [
    // ROW 1 (center row)
    { id: "dark-circles", left: "50%", top: "50%" },
    { id: "signs-of-aging", left: "calc(50% + 170px)", top: "50%" },
    { id: "dullness", left: "calc(50% + 340px)", top: "50%" },

    // ROW 2 (offset row)
    { id: "custom", left: "calc(50% - 85px)", top: "calc(50% + 85px)" },
    { id: "sun-damage-1", left: "calc(50% + 85px)", top: "calc(50% + 85px)" },
    {
      id: "uneven-skin-tone",
      left: "calc(50% + 255px)",
      top: "calc(50% + 85px)",
    },

    // ROW 3 (bottom row)
    { id: "dryness", left: "50%", top: "calc(50% + 170px)" },
    {
      id: "textural-irregularities",
      left: "calc(50% + 170px)",
      top: "calc(50% + 170px)",
    },
    {
      id: "sun-damage-2",
      left: "calc(50% + 340px)",
      top: "calc(50% + 170px)",
    },
  ];

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-[#f4f4f2] text-[#111216]">
      <header className="absolute left-[28px] top-[18px] z-20 flex items-center gap-3">
        <span className="text-[12px] font-semibold tracking-[0.02em]">
          SKINSTRIC
        </span>
        <span className="text-[12px] text-black/35">[ SUMMARY ]</span>
      </header>

      <aside className="absolute left-[-78px] top-1/2 z-20 -translate-y-1/2">
        <div className="relative h-[300px] w-[110px]">
          {/* 🔲 BLACK DIAMOND (moved down) */}
          <div className="absolute top-[50px] flex h-[110px] w-[110px] rotate-45 items-center justify-center border border-black/10 bg-[#111216]">
            <div className="absolute left-[34px] top-1/2 -translate-y-1/2 text-[12px] font-medium text-white">
              ES
            </div>
          </div>

          {/* ✏️ TEXT (moved down + centered better) */}
          <div className="absolute left-[80px] top-[175px] whitespace-nowrap text-[12px] font-medium text-black/40">
            A.I. SUGGESTIONS
          </div>

          {/* 🔳 LIGHT GREY DIAMOND (moved down same amount) */}
          <div className="absolute left-0 top-[210px] flex h-[110px] w-[110px] rotate-45 items-center justify-center border border-black/20 bg-transparent" />
        </div>
      </aside>

      <section className="absolute left-[26px] top-[92px] z-20">
        <div className="mb-2 text-[23px] font-semibold tracking-[-0.03em]">
          A. I. ESTIMATE
        </div>
        <h1 className="text-[56px] font-light leading-[0.95] tracking-[-0.06em]">
          SUMMARY
        </h1>
        <p className="mt-4 max-w-[230px] text-[15px] leading-[1.55] text-black/55">
          Based on the conditional logic A.I. recommends to focus on the
          following concerns
        </p>
      </section>

      <section className="absolute left-[176px] top-1/2 z-20 w-[295px] -translate-y-[14px]">
        <h2 className="whitespace-nowrap text-[34px] font-light leading-[1.02] tracking-[-0.05em]">
          I WANT TO FOCUS ON
        </h2>
        <p className="mt-4 text-[15px] text-black/55">
          Select or deselect concerns
        </p>
      </section>

      <section className="absolute left-1/2 top-[45%] z-10 -translate-x-1/2 -translate-y-1/2">
        {positions.map((position) => {
          const item = CONCERNS.find((entry) => entry.id === position.id);
          if (!item) return null;

          return (
            <div
              key={item.id}
              className="absolute"
              style={{ left: position.left, top: position.top }}
            >
              <Diamond
                item={item}
                selected={selectedId === item.id}
                onClick={() => setSelectedId(item.id)}
              />
            </div>
          );
        })}
      </section>

      <aside className="absolute right-[34px] top-[210px] z-20 h-[368px] w-[290px] border-t border-black/40 bg-black/[0.03] px-[14px] py-[12px]">
        <div className="text-[12px] font-semibold tracking-[0.01em]">
          {selectedConcern.label.replace(/\n/g, " ")}
        </div>

        <div className="mt-[226px] text-[14px] leading-[1.45] text-black/50">
          {selectedConcern.description}
        </div>

        <div className="absolute bottom-[10px] right-[12px] text-[12px] font-semibold">
          FOCUS
        </div>
      </aside>

      <div className="absolute bottom-[28px] left-[28px] z-20 flex items-center gap-3">
        <NavDiamond direction="left" onClick={() => router.back()} />
        <button
          type="button"
          onClick={() => router.back()}
          className="text-[12px] font-medium tracking-[0.01em]"
        >
          BACK
        </button>
      </div>

      <div className="absolute bottom-[28px] right-[28px] z-20 flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            localStorage.setItem("skinstricSelectedConcern", selectedId);
            router.push("/routine-output");
          }}
          className="text-[12px] font-medium tracking-[0.01em]"
        >
          GET FORMULA
        </button>

        <NavDiamond
          direction="right"
          onClick={() => {
            localStorage.setItem("skinstricSelectedConcern", selectedId);
            router.push("/routine-output");
          }}
        />
      </div>
    </main>
  );
}
