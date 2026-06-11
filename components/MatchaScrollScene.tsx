"use client";

import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import ScrollBeat, { ScrollIndicator } from "./ScrollBeat";

const FRAME_COUNT = 120;
const BACKGROUND = "#050505";

function getFramePath(index: number): string {
  return `/matcha-sequence/matcha_${String(index).padStart(3, "0")}.webp`;
}

const BEATS = [
  {
    start: 0,
    end: 0.2,
    title: "ARTISAN CRAFTED",
    subtitle: "The perfect balance of earth and energy.",
    align: "center" as const,
  },
  {
    start: 0.25,
    end: 0.45,
    title: "KINETIC CHILL",
    subtitle: "Crystalline ice suspended in a moment of freshness.",
    align: "left" as const,
  },
  {
    start: 0.5,
    end: 0.7,
    title: "THE DIRTY POUR",
    subtitle: "Rich espresso meets ceremonial grade matcha.",
    align: "right" as const,
  },
  {
    start: 0.75,
    end: 0.95,
    title: "TASTE THE MOMENT",
    subtitle: "Experience the fusion. Order now.",
    align: "center" as const,
    showCta: true,
  },
];

export default function MatchaScrollScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
  });

  const frameIndex = useTransform(smoothProgress, [0, 1], [0, FRAME_COUNT - 1]);

  useMotionValueEvent(frameIndex, "change", (latest) => {
    currentFrameRef.current = Math.floor(Math.min(latest, FRAME_COUNT - 1));
  });

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    const images = imagesRef.current;
    const frame = currentFrameRef.current;
    const img = images[frame];

    if (!canvas || !ctx || !img?.complete || !img.naturalWidth) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const canvasW = rect.width;
    const canvasH = rect.height;

    if (canvas.width !== canvasW * dpr || canvas.height !== canvasH * dpr) {
      canvas.width = canvasW * dpr;
      canvas.height = canvasH * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;
    const scale = Math.min(canvasW / imgW, canvasH / imgH);
    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const x = (canvasW - drawW) / 2;
    const y = (canvasH - drawH) / 2;

    ctx.fillStyle = BACKGROUND;
    ctx.fillRect(0, 0, canvasW, canvasH);
    ctx.drawImage(img, x, y, drawW, drawH);
  }, []);

  const renderLoop = useCallback(() => {
    drawFrame();
    rafIdRef.current = requestAnimationFrame(renderLoop);
  }, [drawFrame]);

  const resizeCanvas = useCallback(() => {
    drawFrame();
  }, [drawFrame]);

  useEffect(() => {
    let cancelled = false;
    let loaded = 0;

    const loadImages = async () => {
      const promises = Array.from({ length: FRAME_COUNT }, (_, i) => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.src = getFramePath(i);
          img.onload = () => {
            if (!cancelled) {
              loaded += 1;
              setLoadProgress(loaded / FRAME_COUNT);
            }
            resolve(img);
          };
          img.onerror = () => reject(new Error(`Failed to load frame ${i}`));
        });
      });

      try {
        const images = await Promise.all(promises);
        if (cancelled) return;
        imagesRef.current = images;
        setIsReady(true);
      } catch (err) {
        console.error("Frame preload failed:", err);
      }
    };

    loadImages();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    ctxRef.current = ctx;
    rafIdRef.current = requestAnimationFrame(renderLoop);

    const wrapper = canvasWrapperRef.current;
    const resizeObserver = wrapper
      ? new ResizeObserver(resizeCanvas)
      : null;

    resizeObserver?.observe(wrapper!);
    window.addEventListener("resize", resizeCanvas);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      resizeObserver?.disconnect();
      window.removeEventListener("resize", resizeCanvas);
      if (ctxRef.current && canvas) {
        ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
      }
      ctxRef.current = null;
    };
  }, [isReady, renderLoop, resizeCanvas]);

  return (
    <>
      {(isLoading || !isReady) && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505]"
          initial={{ opacity: 1 }}
          animate={{ opacity: isReady ? 0 : 1 }}
          transition={{ duration: 0.6, delay: isReady ? 0.2 : 0 }}
          onAnimationComplete={() => {
            if (isReady) setIsLoading(false);
          }}
          style={{ pointerEvents: isReady ? "none" : "auto" }}
        >
          <div className="loading-spinner mb-8 h-10 w-10 rounded-full border border-white/10 border-t-green-400/80" />
          <p className="mb-4 text-xs tracking-[0.25em] text-white/40">
            LOADING EXPERIENCE
          </p>
          <div className="h-px w-48 overflow-hidden bg-white/10 md:w-64">
            <motion.div
              className="h-full bg-green-400/80"
              style={{ width: `${loadProgress * 100}%` }}
              transition={{ duration: 0.15 }}
            />
          </div>
          <p className="mt-3 text-xs tabular-nums text-white/30">
            {Math.round(loadProgress * 100)}%
          </p>
        </motion.div>
      )}

      <div ref={containerRef} className="relative" style={{ height: "400vh" }}>
        <div
          ref={canvasWrapperRef}
          className="sticky top-0 h-screen w-full overflow-hidden"
        >
          <canvas
            ref={canvasRef}
            className="block h-full w-full"
            aria-label="Artisan Iced Dirty Matcha Latte animation"
          />

          {BEATS.map((beat) => (
            <ScrollBeat
              key={beat.title}
              progress={smoothProgress}
              start={beat.start}
              end={beat.end}
              title={beat.title}
              subtitle={beat.subtitle}
              align={beat.align}
              showCta={beat.showCta}
            />
          ))}

          <ScrollIndicator progress={smoothProgress} />
        </div>
      </div>
    </>
  );
}
