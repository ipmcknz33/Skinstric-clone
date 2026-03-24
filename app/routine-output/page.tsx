"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Item = {
  id: string;
  label: string;
};

const ITEMS: Item[] = [
  { id: "clogged", label: "CLOGGED PORES" },
  { id: "oily", label: "OILY SKIN" },
  { id: "ai", label: "A.I. SUGGESTIONS" },
  { id: "wrinkling", label: "WRINKLING" },
];

function Diamond({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`absolute flex h-[114px] w-[114px] -translate-x-1/2 -translate-y-1/2 rotate-45 items-center justify-center border transition-all duration-200 ${
        selected
          ? "bg-[#111216] text-white border-[#111216]"
          : "bg-[#ececeb] text-black/80 border-transparent"
      }`}
    >
      <span className="-rotate-45 text-[13px] font-semibold text-center leading-[1.2]">
        {label}
      </span>
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
      onClick={onClick}
      className="flex h-[26px] w-[26px] rotate-45 items-center justify-center border border-black/60"
    >
      <span className="absolute -rotate-45 text-[10px]">{arrow}</span>
    </button>
  );
}

export default function RoutineOutputPage() {
  const router = useRouter();
  const [selected, setSelected] = useState("clogged");

  const positions = [
    { id: "clogged", left: "50%", top: "40%" },
    { id: "oily", left: "calc(50% - 85px)", top: "calc(40% + 85px)" },
    { id: "ai", left: "calc(50% + 85px)", top: "calc(40% + 85px)" },
    { id: "wrinkling", left: "50%", top: "calc(40% + 170px)" },
  ];

  return (
    <main className="relative h-[100dvh] w-full bg-[#f4f4f2] text-[#111216]">
      {/* HEADER */}
      <header className="absolute left-[28px] top-[18px] flex gap-3">
        <span className="text-[12px] font-semibold">SKINSTRIC</span>
        <span className="text-[12px] text-black/35">[ SUMMARY ]</span>
      </header>

      {/* TITLE */}
      <section className="absolute left-[26px] top-[92px]">
        <div className="text-[23px] font-semibold">A. I. ESTIMATE</div>
        <h1 className="text-[56px] font-light leading-[0.95]">SUMMARY</h1>
        <p className="mt-4 max-w-[230px] text-[15px] text-black/55">
          Based on the conditional logic A.I. recommends to focus on the
          following concerns
        </p>
      </section>

      {/* CENTER TEXT */}
      <section className="absolute left-1/2 top-[45%] -translate-x-1/2 text-center">
        <h2 className="text-[28px] font-light tracking-[-0.03em]">
          I WANT TO FOCUS ON
        </h2>
        <p className="text-[14px] text-black/55 mt-2">
          Select or deselect concerns
        </p>
      </section>

      {/* DIAMONDS */}
      <section className="absolute left-[25%] top-[40%] -translate-x-1/2 -translate-y-1/2">
        {positions.map((pos) => {
          const item = ITEMS.find((i) => i.id === pos.id);
          if (!item) return null;

          return (
            <div
              key={item.id}
              style={{ left: pos.left, top: pos.top }}
              className="absolute"
            >
              <Diamond
                label={item.label}
                selected={selected === item.id}
                onClick={() => setSelected(item.id)}
              />
            </div>
          );
        })}
      </section>

      {/* RIGHT FLOATING DIAMOND */}
      <div className="absolute right-[240px] top-[42%] flex flex-col text-center">
        <div className="text-[12px] mb-[-20px] text-black/70">1 / 7</div>

        <div className="flex h-[114px] w-[114px] rotate-45 items-center justify-center border border-black/20 bg-transparent">
          <span className="-rotate-45 text-[12px] text-center font-medium">
            HAVEN'T FOUND
            <br />
            YOURS?
          </span>
        </div>
      </div>

      {/* SMALL CENTER ICON */}
      <div className="absolute left-1/2 bottom-[120px] -translate-x-1/2 text-center">
        <div className="flex h-[40px] w-[40px] rotate-45 border border-black/20 items-center justify-center mx-auto mb-2">
          <span className="-rotate-45 text-[12px]">+</span>
        </div>
        <div className="text-[10px] text-black/40">
          TAP CONCERN
          <br />
          TO FIND OUT MORE
        </div>
      </div>

      {/* NAV */}
      <div className="absolute bottom-[28px] left-[28px] flex items-center gap-3">
        <NavDiamond direction="left" onClick={() => router.back()} />
        <span className="text-[12px]">BACK</span>
      </div>

      <div className="absolute bottom-[28px] right-[28px] flex items-center gap-3">
        <span className="text-[12px]">GET FORMULA</span>
        <NavDiamond direction="right" onClick={() => {}} />
      </div>
    </main>
  );
}
