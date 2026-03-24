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

  useEffect(() => {
    if (!pageRef.current) return;

    gsap.fromTo(
      pageRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: "power2.out" },
    );

    [leftARef.current, leftBRef.current, leftCRef.current].forEach((el, i) => {
      if (!el) return;
      gsap.to(el, {
        rotate: "+=360",
        duration: 42 + i * 6,
        repeat: -1,
        ease: "none",
      });
    });

    [rightARef.current, rightBRef.current, rightCRef.current].forEach(
      (el, i) => {
        if (!el) return;
        gsap.to(el, {
          rotate: "-=360",
          duration: 44 + i * 6,
          repeat: -1,
          ease: "none",
        });
      },
    );
  }, []);

  // ✅ FIXED (no TypeScript errors)
  const handleGallerySelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        localStorage.setItem("skinstricCapturedImage", reader.result);
        router.push("/analysis");
      }
    };

    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <main className="h-screen overflow-hidden bg-[#f4f4f2] text-[#1A1B1C]">
      <div ref={pageRef} className="relative h-screen overflow-hidden">
        {/* ✅ hidden input */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleGallerySelect}
        />

        {/* LEFT BUTTON (unchanged) */}
        <button
          type="button"
          onClick={() => setShowPermission(true)}
          className="group relative h-[min(58vh,460px)] w-full cursor-pointer bg-transparent"
        >
          {/* your UI untouched */}
        </button>

        {/* RIGHT GALLERY BUTTON (WORKS NOW) */}
        <button
          type="button"
          onClick={() => galleryInputRef.current?.click()}
          className="group relative h-[min(58vh,460px)] w-full cursor-pointer bg-transparent"
        >
          <div className="absolute left-[54%] top-[46%] -translate-x-1/2 -translate-y-1/2">
            <Image
              src="/icons/gallery.png"
              alt="gallery"
              width={130}
              height={130}
              className="h-[72px] w-[72px] object-contain md:h-[130px] md:w-[130px]"
              priority
            />
          </div>
        </button>
      </div>
    </main>
  );
}
