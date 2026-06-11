"use client";

import {
  motion,
  useTransform,
  type MotionValue,
} from "framer-motion";

export type BeatAlignment = "center" | "left" | "right";

export interface ScrollBeatProps {
  progress: MotionValue<number>;
  start: number;
  end: number;
  title: string;
  subtitle: string;
  align?: BeatAlignment;
  showCta?: boolean;
}

const alignmentClasses: Record<BeatAlignment, string> = {
  center: "justify-center items-center text-center px-6 md:px-12",
  left: "justify-start items-start text-left pl-8 md:pl-16 lg:pl-24 pr-6",
  right: "justify-end items-end text-right pr-8 md:pr-16 lg:pr-24 pl-6",
};

export default function ScrollBeat({
  progress,
  start,
  end,
  title,
  subtitle,
  align = "center",
  showCta = false,
}: ScrollBeatProps) {
  const fadeStart = start;
  const fadeInEnd = start + 0.1;
  const fadeOutStart = end - 0.1;
  const fadeEnd = end;

  const opacity = useTransform(
    progress,
    [fadeStart, fadeInEnd, fadeOutStart, fadeEnd],
    [0, 1, 1, 0]
  );

  const y = useTransform(
    progress,
    [fadeStart, fadeInEnd, fadeOutStart, fadeEnd],
    [20, 0, 0, -20]
  );

  return (
    <motion.div
      className={`pointer-events-none absolute inset-0 z-20 flex ${alignmentClasses[align]}`}
      style={{ opacity, y, willChange: "transform, opacity" }}
    >
      <div className="flex max-w-4xl flex-col justify-center pt-24 md:pt-0">
        <h2 className="text-7xl font-light tracking-tight text-white/90 md:text-8xl lg:text-9xl">
          {title}
        </h2>
        <p className="mt-4 max-w-xl text-lg text-white/60 md:mt-6 md:text-xl">
          {subtitle}
        </p>
        {showCta && (
          <motion.a
            href="#order"
            className="pointer-events-auto mt-10 inline-flex self-center border border-white/20 px-10 py-4 text-sm tracking-widest text-green-400/80 transition-colors duration-300 hover:border-green-400/80"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            ORDER NOW
          </motion.a>
        )}
      </div>
    </motion.div>
  );
}

export interface ScrollIndicatorProps {
  progress: MotionValue<number>;
}

export function ScrollIndicator({ progress }: ScrollIndicatorProps) {
  const opacity = useTransform(progress, [0, 0.1], [1, 0]);
  const y = useTransform(progress, [0, 0.1], [0, -10]);

  return (
    <motion.div
      className="pointer-events-none absolute bottom-12 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-3"
      style={{ opacity, y, willChange: "transform, opacity" }}
    >
      <span className="text-xs tracking-[0.3em] text-white/40">
        SCROLL TO EXPLORE
      </span>
      <motion.div
        className="h-8 w-px bg-gradient-to-b from-green-400/80 to-transparent"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}
