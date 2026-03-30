"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";

export default function ResultPage() {
  const router = useRouter();
  const [showPermission, setShowPermission] = useState(false);

  const pageRef = useRef<HTMLDivElement | null>(null);

  const leftARef = useRef<HTMLDivElement | null>(null);
  const leftBRef = useRef<HTMLDivElement | null>(null);
  const leftCRef = useRef<HTMLDivElement | null>(null);

  const rightARef = useRef<HTMLDivElement | null>(null);
  const rightBRef = useRef<HTMLDivElement | null>(null);
  const rightCRef = useRef<HTMLDivElement | null>(null);

  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const handleGallerySelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        localStorage.setItem("skinstricCapturedImage", reader.result);
        router.push("/analysis");
      }
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  };

  useEffect(() => {
    if (!pageRef.current) return;

    gsap.fromTo(
      pageRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: "power2.out" },
    );

    const leftSquares = [leftARef.current, leftBRef.current, leftCRef.current];
    const rightSquares = [
      rightARef.current,
      rightBRef.current,
      rightCRef.current,
    ];

    leftSquares.forEach((el, index) => {
      if (!el) return;
      gsap.to(el, {
        rotate: "+=360",
        duration: 42 + index * 6,
        ease: "none",
        repeat: -1,
        transformOrigin: "50% 50%",
      });
    });

    rightSquares.forEach((el, index) => {
      if (!el) return;
      gsap.to(el, {
        rotate: "-=360",
        duration: 44 + index * 6,
        ease: "none",
        repeat: -1,
        transformOrigin: "50% 50%",
      });
    });
  }, []);

  return (
    <main className="min-h-screen bg-[#f4f4f2] text-[#1A1B1C]">
      <div
        ref={pageRef}
        className="relative min-h-screen overflow-hidden px-3 pb-24 pt-[64px] md:h-screen md:overflow-hidden md:px-0 md:pb-0 md:pt-0"
      >
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleGallerySelect}
        />

        <header className="absolute left-0 top-0 z-30 flex w-full items-start justify-between px-3 py-2">
          <div className="text-[11px] font-semibold uppercase tracking-[0.06em]">
            Skinstric{" "}
            <span className="ml-2 font-normal text-black/40">[ Intro ]</span>
          </div>

          <button className="border border-black bg-black px-3 py-2 text-[9px] font-medium uppercase tracking-[0.06em] text-white">
            Enter Code
          </button>
        </header>

        <div className="absolute left-3 top-[70px] z-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.01em] text-black">
            To Start Analysis
          </p>
        </div>

        <section className="mx-auto flex w-full max-w-[1500px] items-center justify-center md:h-screen md:px-4 md:pt-[64px]">
          <div className="grid w-full grid-cols-1 gap-8 pt-[60px] md:h-full md:grid-cols-[1fr_1fr_96px] md:items-center md:gap-4 md:overflow-hidden lg:gap-8">
            {/* LEFT BLOCK */}
            <button
              type="button"
              onClick={() => setShowPermission(true)}
              className="group relative mx-auto h-[300px] w-full max-w-[420px] cursor-pointer bg-transparent sm:h-[360px] md:mx-0 md:h-[min(58vh,460px)] md:max-w-none"
            >
              <div className="absolute left-1/2 top-1/2 h-[240px] w-[240px] -translate-x-1/2 -translate-y-1/2 sm:h-[290px] sm:w-[290px] md:left-[46%] md:h-[min(46vh,360px)] md:w-[min(46vh,360px)]">
                <div
                  ref={leftARef}
                  className="absolute left-1/2 top-1/2 h-[86%] w-[86%] -translate-x-1/2 -translate-y-1/2 rotate-[8deg] border-2 border-dashed border-[#A0A4AB]/55"
                  style={{ willChange: "transform" }}
                />
                <div
                  ref={leftBRef}
                  className="absolute left-1/2 top-1/2 h-[93%] w-[93%] -translate-x-1/2 -translate-y-1/2 rotate-[22deg] border-2 border-dashed border-[#A0A4AB]/35"
                  style={{ willChange: "transform" }}
                />
                <div
                  ref={leftCRef}
                  className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 rotate-[-16deg] border-2 border-dashed border-[#A0A4AB]/22"
                  style={{ willChange: "transform" }}
                />
              </div>

              <div className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-translate-y-[54%] md:left-[41%]">
                <Image
                  src="/icons/camera.png"
                  alt="camera"
                  width={130}
                  height={130}
                  className="h-[72px] w-[72px] object-contain opacity-100 transition-all duration-300 ease-out group-hover:drop-shadow-[0_8px_20px_rgba(0,0,0,0.12)] md:h-[130px] md:w-[130px]"
                  priority
                />
              </div>

              <div className="absolute left-[58%] top-[20%] transition-all duration-300 ease-out group-hover:opacity-100 sm:left-[60%] md:left-[48%] md:top-[28%]">
                <svg
                  viewBox="0 0 86 62"
                  className="h-[42px] w-[58px] md:h-[54px] md:w-[76px]"
                  aria-hidden="true"
                >
                  <line
                    x1="9"
                    y1="54"
                    x2="78"
                    y2="12"
                    stroke="#1A1B1C"
                    strokeWidth="1.4"
                    className="transition-all duration-300"
                  />
                  <circle
                    cx="82"
                    cy="10"
                    r="3"
                    fill="#F4F4F2"
                    stroke="#1A1B1C"
                    strokeWidth="1.2"
                    className="transition-all duration-300"
                  />
                </svg>
              </div>

              <div className="absolute left-[68%] top-[16%] max-w-[120px] text-left transition-all duration-300 ease-out group-hover:translate-x-[2px] sm:left-[70%] md:left-[60%] md:top-[25.5%] md:max-w-none">
                <p className="text-[10px] font-normal uppercase leading-[1.45] tracking-[0.01em] text-[#1A1B1C] sm:text-[11px] md:text-[13px]">
                  Allow A.I.
                  <br />
                  To Scan Your Face
                </p>
              </div>
            </button>

            {/* RIGHT BLOCK */}
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="group relative mx-auto h-[300px] w-full max-w-[420px] cursor-pointer bg-transparent sm:h-[360px] md:mx-0 md:h-[min(58vh,460px)] md:max-w-none"
            >
              <div className="absolute left-1/2 top-1/2 h-[240px] w-[240px] -translate-x-1/2 -translate-y-1/2 sm:h-[290px] sm:w-[290px] md:left-[54%] md:h-[min(46vh,360px)] md:w-[min(46vh,360px)]">
                <div
                  ref={rightARef}
                  className="absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rotate-[10deg] border-2 border-dashed border-[#A0A4AB]/55"
                  style={{ willChange: "transform" }}
                />
                <div
                  ref={rightBRef}
                  className="absolute left-1/2 top-1/2 h-[88%] w-[88%] -translate-x-1/2 -translate-y-1/2 rotate-[-22deg] border-2 border-dashed border-[#A0A4AB]/35"
                  style={{ willChange: "transform" }}
                />
                <div
                  ref={rightCRef}
                  className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 rotate-[18deg] border-2 border-dashed border-[#A0A4AB]/22"
                  style={{ willChange: "transform" }}
                />
              </div>

              <div className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-translate-y-[54%] md:left-[54%]">
                <Image
                  src="/icons/gallery.png"
                  alt="gallery"
                  width={130}
                  height={130}
                  className="h-[72px] w-[72px] object-contain opacity-100 transition-all duration-300 ease-out group-hover:drop-shadow-[0_8px_20px_rgba(0,0,0,0.12)] md:h-[130px] md:w-[130px]"
                  priority
                />
              </div>

              <div className="absolute left-[20%] top-[63%] transition-all duration-300 ease-out group-hover:opacity-100 sm:left-[22%] md:left-[40.2%] md:top-[56.2%]">
                <svg
                  viewBox="0 0 86 62"
                  className="h-[42px] w-[58px] md:h-[54px] md:w-[76px]"
                  aria-hidden="true"
                >
                  <line
                    x1="78"
                    y1="8"
                    x2="14"
                    y2="56"
                    stroke="#1A1B1C"
                    strokeWidth="1.4"
                  />
                  <circle
                    cx="10"
                    cy="58"
                    r="3"
                    fill="#F4F4F2"
                    stroke="#1A1B1C"
                    strokeWidth="1.2"
                  />
                </svg>
              </div>

              <div className="absolute left-[2%] top-[76%] max-w-[120px] text-right transition-all duration-300 ease-out group-hover:-translate-x-[2px] sm:left-[5%] md:left-[23.5%] md:top-[67%] md:max-w-none">
                <p className="text-[10px] font-normal uppercase leading-[1.45] tracking-[0.01em] text-[#1A1B1C] sm:text-[11px] md:text-[13px]">
                  Allow A.I.
                  <br />
                  Access Gallery
                </p>
              </div>
            </button>

            {/* PREVIEW */}
            <div className="mx-auto flex w-full max-w-[420px] items-start justify-end md:mx-0 md:block md:w-auto md:self-start md:pt-[50px]">
              <div className="md:-ml-[50px]">
                <p className="mb-2 text-right text-[12px] text-black/80 md:text-left">
                  Preview
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/demographics")}
                  aria-label="Open demographics page"
                  className="block h-[90px] w-[90px] border border-black/10 bg-transparent sm:h-[105px] sm:w-[105px]"
                />
              </div>
            </div>
          </div>
        </section>

        {showPermission && (
          <div className="absolute inset-0 z-40">
            <div
              className="absolute inset-0 bg-black/0"
              onClick={() => setShowPermission(false)}
            />

            <div
              className="absolute left-1/2 top-1/2 z-50 w-[calc(100vw-32px)] max-w-[352px] -translate-x-1/2 -translate-y-1/2 md:left-[420px] md:top-[50%] md:w-[352px] md:-translate-x-0 md:-translate-y-0"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-[#1A1B1C] pb-2 pt-4">
                <h2 className="mb-12 pl-4 text-base font-semibold leading-[24px] text-[#FCFCFC]">
                  ALLOW A.I. TO ACCESS YOUR CAMERA
                </h2>

                <div className="mt-4 flex border-t border-[#FCFCFC] pt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPermission(false);
                    }}
                    className="cursor-pointer px-7 text-sm font-normal leading-4 tracking-tight text-[#fcfcfca1] hover:text-gray-500"
                  >
                    DENY
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      localStorage.setItem("skinstricCameraApproved", "true");
                      setShowPermission(false);
                      router.push("/camera");
                    }}
                    className="cursor-pointer px-5 text-sm font-semibold leading-4 tracking-tight text-[#FCFCFC] hover:text-gray-300"
                  >
                    ALLOW
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => router.push("/test")}
          aria-label="Back"
          className="absolute bottom-3 left-3 z-20 flex items-center gap-4"
        >
          <div className="relative flex h-8 w-8 rotate-45 items-center justify-center border border-black">
            <span className="absolute -rotate-45 text-[11px] leading-none">
              ◀
            </span>
          </div>
          <span className="text-[12px] uppercase tracking-[0.04em]">Back</span>
        </button>
      </div>
    </main>
  );
}
