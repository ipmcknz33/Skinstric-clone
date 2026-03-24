"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type CameraStep = "permission" | "loading" | "camera" | "error";

const STORAGE_KEYS = {
  capturedImage: "skinstricCapturedImage",
  phaseTwoResponse: "skinstricPhaseTwoResponse",
  phaseTwoError: "skinstricPhaseTwoError",
};

export default function CameraPage() {
  const router = useRouter();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const hasAutoOpenedRef = useRef(false);

  const [step, setStep] = useState<CameraStep>("permission");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [timerMode, setTimerMode] = useState<0 | 3 | 10>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [cameraError, setCameraError] = useState<string>("");
  const [showGreatShot, setShowGreatShot] = useState(false);

  useEffect(() => {
    const approved = localStorage.getItem("skinstricCameraApproved");

    if (approved === "true" && !hasAutoOpenedRef.current) {
      hasAutoOpenedRef.current = true;
      localStorage.removeItem("skinstricCameraApproved");
      void openCamera();
    }

    return () => {
      stopCurrentStream();
    };
  }, []);

  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      captureStill();
      setCountdown(null);
      return;
    }

    const timer = window.setTimeout(() => {
      setCountdown((current) => (current === null ? null : current - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [countdown]);

  function clearPreviousAnalysisState() {
    try {
      localStorage.removeItem(STORAGE_KEYS.phaseTwoResponse);
      localStorage.removeItem(STORAGE_KEYS.phaseTwoError);
    } catch {}
  }

  function stopCurrentStream() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
  }

  async function openCamera() {
    try {
      stopCurrentStream();
      setCapturedImage(null);
      setCountdown(null);
      setShowGreatShot(false);
      setCameraError("");
      setStep("loading");

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported in this browser.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      streamRef.current = stream;

      window.setTimeout(async () => {
        if (!videoRef.current) {
          setStep("camera");
          return;
        }

        videoRef.current.srcObject = stream;

        try {
          await videoRef.current.play();
        } catch (playError: any) {
          throw new Error(
            playError?.message || "Could not play camera stream.",
          );
        }

        setStep("camera");
      }, 600);
    } catch (error: any) {
      console.error("openCamera failed:", error);
      setCameraError(
        `${error?.name || "CameraError"}: ${
          error?.message || "Unable to access camera"
        }`,
      );
      setStep("error");
    }
  }

  function captureStill() {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) return;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCapturedImage(dataUrl);
    setShowGreatShot(true);

    try {
      clearPreviousAnalysisState();
      localStorage.setItem(STORAGE_KEYS.capturedImage, dataUrl);
    } catch {}
  }

  function handleTakePicture() {
    if (step !== "camera" || countdown !== null || capturedImage) return;

    setShowGreatShot(false);

    if (timerMode === 0) {
      captureStill();
      return;
    }

    setCountdown(timerMode);
  }

  function handleRetake() {
    void openCamera();
  }

  function handleProceed() {
    stopCurrentStream();
    router.push("/analysis");
  }

  function handleOpenFilePicker() {
    fileInputRef.current?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      if (!result) return;

      setCapturedImage(result);
      setShowGreatShot(true);

      try {
        clearPreviousAnalysisState();
        localStorage.setItem(STORAGE_KEYS.capturedImage, result);
      } catch {}
    };

    reader.readAsDataURL(file);
  }

  const showCameraUi = step === "camera" || !!capturedImage;
  const showTimerBar = !capturedImage;
  const showCountdown = countdown !== null && countdown > 0;

  return (
    <main className="relative h-[100dvh] w-screen overflow-hidden overscroll-none bg-[#f4f4f2]">
      {!capturedImage && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 h-full w-full object-cover ${
            step === "camera" ? "block" : "hidden"
          }`}
        />
      )}

      {capturedImage && (
        <Image
          src={capturedImage}
          alt="Captured selfie"
          fill
          unoptimized
          className="object-cover"
          priority
        />
      )}

      {!showCameraUi && <div className="absolute inset-0 bg-[#cfcfcb]" />}

      <header className="absolute left-0 top-0 z-20 flex w-full items-start justify-between px-3 py-2">
        <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-white/85">
          Skinstric{" "}
          <span className="ml-2 font-normal text-white/55">[ Analysis ]</span>
        </div>
      </header>

      {showCameraUi && (
        <>
          <div className="pointer-events-none absolute inset-0 z-10">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <mask id="screen-oval-hole">
                  <rect width="100" height="100" fill="grey" />
                  <ellipse cx="50" cy="50" rx="13.5" ry="33" fill="black" />
                </mask>
              </defs>

              <rect
                width="100"
                height="100"
                fill="rgba(207,207,203,0.72)"
                mask="url(#screen-oval-hole)"
              />

              <ellipse
                cx="50"
                cy="50"
                rx="13.5"
                ry="33"
                fill="none"
                stroke="rgba(255,255,255,0.95)"
                strokeWidth="0.18"
              />
            </svg>

            {showCountdown && (
              <div className="absolute left-1/2 top-[132px] -translate-x-1/2 text-center text-white">
                <div className="flex items-end justify-center gap-3">
                  <span
                    className={`text-[18px] font-light leading-none ${
                      countdown === 3 ? "opacity-100" : "opacity-45"
                    }`}
                  >
                    1
                  </span>
                  <span
                    className={`text-[42px] font-light leading-none ${
                      countdown === 2 ? "opacity-100" : "opacity-45"
                    }`}
                  >
                    2
                  </span>
                  <span
                    className={`text-[18px] font-light leading-none ${
                      countdown === 1 ? "opacity-100" : "opacity-45"
                    }`}
                  >
                    3
                  </span>
                </div>

                <p className="mt-2 text-[11px] font-normal uppercase tracking-[0.04em] text-white">
                  Hold still
                </p>
              </div>
            )}

            {capturedImage && showGreatShot && (
              <div className="absolute left-1/2 top-[174px] -translate-x-1/2 text-center">
                <p className="text-[11px] font-normal uppercase tracking-[0.04em] text-white">
                  Great Shot!
                </p>
              </div>
            )}
          </div>

          <div className="absolute bottom-10 left-1/2 z-20 -translate-x-1/2 text-center">
            <p className="text-[11px] font-normal uppercase tracking-[0.04em] text-white">
              To get better results make sure to have
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-7 text-[11px] font-normal uppercase tracking-[0.02em] text-white">
              <span>◇ Neutral Expression</span>
              <span>◇ Frontal Pose</span>
              <span>◇ Adequate Lighting</span>
            </div>
          </div>

          <div className="absolute bottom-3 left-3 z-20">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Back"
              className="flex items-center gap-4"
            >
              <div className="relative flex h-8 w-8 rotate-45 items-center justify-center border border-white/80">
                <span className="absolute -rotate-45 text-[11px] leading-none">
                  ◀
                </span>
              </div>
              <span className="text-[12px] uppercase tracking-[0.04em] text-white">
                Back
              </span>
            </button>
          </div>

          <div className="absolute left-4 top-1/2 z-20 -translate-y-1/2 md:left-10">
            {showTimerBar ? (
              <div className="flex items-center gap-5 rounded-full bg-white/10 px-4 py-3 text-[12px] uppercase tracking-[0.04em] text-white backdrop-blur-[1px]">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/45 text-[18px]">
                    ⏱
                  </span>
                </span>

                <button
                  type="button"
                  onClick={() => setTimerMode(0)}
                  className={timerMode === 0 ? "text-white" : "text-white/55"}
                >
                  Off
                </button>

                <button
                  type="button"
                  onClick={() => setTimerMode(3)}
                  className={timerMode === 3 ? "text-white" : "text-white/55"}
                >
                  3s
                </button>

                <button
                  type="button"
                  onClick={() => setTimerMode(10)}
                  className={timerMode === 10 ? "text-white" : "text-white/55"}
                >
                  10s
                </button>
              </div>
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/45 text-[18px] text-white">
                  ⏱
                </span>
              </div>
            )}
          </div>

          <div className="absolute right-4 top-1/2 z-20 -translate-y-1/2 md:right-10">
            {!capturedImage ? (
              <button
                type="button"
                onClick={handleTakePicture}
                disabled={countdown !== null}
                className="inline-flex items-center gap-4 text-[12px] uppercase tracking-[0.04em] text-white disabled:opacity-50"
              >
                Take picture
                <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/80">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/60 text-[18px]">
                    📷
                  </span>
                </span>
              </button>
            ) : (
              <div className="flex flex-col items-end gap-6">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="inline-flex items-center gap-4 text-[12px] uppercase tracking-[0.04em] text-white"
                >
                  Retake
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/80">
                    <span className="text-[22px]">↻</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleProceed}
                  className="inline-flex items-center gap-3 text-[12px] uppercase tracking-[0.04em] text-white"
                >
                  Proceed
                  <span className="flex h-10 w-10 items-center justify-center rotate-45 border border-white/80">
                    <span className="-rotate-45 text-base leading-none">›</span>
                  </span>
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {step === "permission" && (
        <div className="absolute inset-0 z-40 flex items-center justify-center">
          <div className="w-[340px] bg-[#151515] text-white shadow-[0_0_0_1px_rgba(0,0,0,0.45)]">
            <div className="px-5 pt-5 pb-11 text-[12px] font-semibold uppercase tracking-[0.04em]">
              Allow A.I. to access your camera
            </div>

            <div className="h-px w-full bg-white/70" />

            <div className="flex items-center justify-end gap-10 px-5 py-2 text-[11px] uppercase tracking-[0.04em]">
              <button
                type="button"
                onClick={() => router.back()}
                className="text-white/90"
              >
                Deny
              </button>

              <button type="button" onClick={openCamera} className="text-white">
                Allow
              </button>
            </div>
          </div>
        </div>
      )}

      {step === "loading" && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#f4f4f2]">
          <div className="flex flex-col items-center">
            <div className="relative flex h-[260px] w-[260px] items-center justify-center">
              <div className="absolute h-[160px] w-[160px] rotate-[35deg] border border-dashed border-black/15" />
              <div className="absolute h-[160px] w-[160px] rotate-[8deg] border border-dashed border-black/18" />
              <div className="absolute h-[160px] w-[160px] rotate-[-22deg] border border-dashed border-black/12" />

              <div className="relative z-10 flex flex-col items-center">
                <div className="flex h-[74px] w-[74px] items-center justify-center rounded-full border border-black/80">
                  <div className="flex h-[62px] w-[62px] items-center justify-center rounded-full border border-black/50">
                    <Image
                      src="/icons/camera.png"
                      alt="Camera"
                      width={34}
                      height={34}
                      className="object-contain"
                    />
                  </div>
                </div>

                <p className="mt-4 text-[12px] font-semibold uppercase tracking-[0.04em] text-black">
                  Setting up camera ...
                </p>
              </div>
            </div>

            <div className="mt-3 text-center">
              <p className="text-[11px] uppercase tracking-[0.04em] text-black">
                To get better results make sure to have
              </p>

              <div className="mt-4 flex items-center gap-7 text-[11px] uppercase tracking-[0.02em] text-black">
                <span>◇ Neutral Expression</span>
                <span>◇ Frontal Pose</span>
                <span>◇ Adequate Lighting</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === "error" && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/30 px-6">
          <div className="bg-white px-6 py-5 text-center text-black">
            <p className="text-[12px] uppercase tracking-[0.04em]">
              Unable to access camera
            </p>

            <p className="mt-2 max-w-[280px] text-[11px] leading-4 text-black/70">
              {cameraError ||
                "Live camera could not be started on this device."}
            </p>

            <div className="mt-4 flex flex-col gap-3">
              <button
                type="button"
                onClick={openCamera}
                className="border border-black px-4 py-2 text-[11px] uppercase tracking-[0.04em]"
              >
                Try live camera again
              </button>

              <button
                type="button"
                onClick={handleOpenFilePicker}
                className="border border-black px-4 py-2 text-[11px] uppercase tracking-[0.04em]"
              >
                Use device camera / upload photo
              </button>
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleFileChange}
        className="hidden"
      />

      <canvas ref={canvasRef} className="hidden" />
    </main>
  );
}
