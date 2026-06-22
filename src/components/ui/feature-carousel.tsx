"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Pizza04Icon,
  CommandFreeIcons,
  GlobalSearchIcon,
  AiCloudIcon,
  SmartPhone01Icon,
  CheckmarkCircle01Icon,
  DashboardSquare01Icon,
  MagicWandIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "../../lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";

const FEATURES = [
  {
    id: "notie",
    label: "Notie",
    icon: "\uD83D\uDCC2",
    image: "https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=1200",
    description: "Fully personalised customizable notes app.",
    tag: "App / Notes",
    link: "https://website-gold-six-23.vercel.app/"
  },
  {
    id: "fintrack",
    label: "FinTrack",
    icon: "\uD83E\uDDEE",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1200",
    description: "Open-source finance recording app.",
    tag: "App / Finance",
    link: "https://fintrack-website-virid.vercel.app/"
  },
  {
    id: "katlans",
    label: "Katlans (.kl)",
    icon: "\u26A1",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200",
    description: "Custom language .kl to C to binary.",
    tag: "Language / Compiler",
    link: "https://github.com/katrate/katlans"
  },
  {
    id: "palimpsest",
    label: "Palimpsest",
    icon: "\u2328\uFE0F",
    image: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?q=80&w=1200",
    description: "Git-inspired snapshot browser TUI.",
    tag: "CLI / Tool",
    link: "https://github.com/katrate/palimpsest"
  },
  {
    id: "shellmax",
    label: "ShellMax",
    icon: "\uD83D\uDCBB",
    image: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?q=80&w=1200",
    description: "CLI for workspace and system info.",
    tag: "CLI / Tool",
    link: "https://github.com/katrate/shellmax"
  },
  {
    id: "envlock",
    label: "EnvLock",
    icon: "\uD83D\uDD12",
    image: "https://images.unsplash.com/photo-1614064641913-6b1e406f2f3d?q=80&w=1200",
    description: "Encrypt .env files for safe Git sharing.",
    tag: "CLI / Tool",
    link: "https://github.com/katrate/envlock"
  },
  {
    id: "gesture",
    label: "Gesture Control",
    icon: "\u270B",
    image: "https://images.unsplash.com/photo-1555255707-c07966088b7b?q=80&w=1200",
    description: "Hand gesture recognition with OpenCV.",
    tag: "Python / CV",
    link: "/python/gesture_control.py",
    download: true
  },
  {
    id: "headswipe",
    label: "Head Swipe",
    icon: "\uD83D\uDC46",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200",
    description: "Head movement swipe detection.",
    tag: "Python / CV",
    link: "/python/head_swipe.py",
    download: true
  }
];

const AUTO_PLAY_INTERVAL = 3000;
const ITEM_HEIGHT = 65;

const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

export function FeatureCarousel() {
  const [step, setStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentIndex =
    ((step % FEATURES.length) + FEATURES.length) % FEATURES.length;

  const nextStep = useCallback(() => {
    setStep((prev) => prev + 1);
  }, []);

  const handleChipClick = (index: number) => {
    const diff = (index - currentIndex + FEATURES.length) % FEATURES.length;
    if (diff > 0) setStep((s) => s + diff);
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextStep, AUTO_PLAY_INTERVAL);
    return () => clearInterval(interval);
  }, [nextStep, isPaused]);

  const getCardStatus = (index: number) => {
    const diff = index - currentIndex;
    const len = FEATURES.length;

    let normalizedDiff = diff;
    if (diff > len / 2) normalizedDiff -= len;
    if (diff < -len / 2) normalizedDiff += len;

    if (normalizedDiff === 0) return "active";
    if (normalizedDiff === -1) return "prev";
    if (normalizedDiff === 1) return "next";
    return "hidden";
  };

  return (
    <div className="w-full max-w-7xl mx-auto md:p-8">
      <div className="relative overflow-hidden rounded-[2.5rem] lg:rounded-[4rem] flex flex-col lg:flex-row min-h-[600px] lg:aspect-video border-4 border-dark shadow-[8px_8px_0px_0px_var(--color-dark)] bg-white">
        <div className="w-full lg:w-[40%] min-h-[350px] md:min-h-[450px] lg:h-full relative z-30 flex flex-col items-start justify-center overflow-hidden px-8 md:px-16 lg:pl-16 bg-accent border-r-4 border-dark">
          <div className="absolute inset-x-0 top-0 h-12 md:h-20 lg:h-16 bg-gradient-to-b from-accent via-accent/80 to-transparent z-40" />
          <div className="absolute inset-x-0 bottom-0 h-12 md:h-20 lg:h-16 bg-gradient-to-t from-accent via-accent/80 to-transparent z-40" />
          <div className="relative w-full h-full flex items-center justify-center lg:justify-start z-20">
            {FEATURES.map((feature, index) => {
              const isActive = index === currentIndex;
              const distance = index - currentIndex;
              const wrappedDistance = wrap(
                -(FEATURES.length / 2),
                FEATURES.length / 2,
                distance
              );

              return (
                <motion.div
                  key={feature.id}
                  style={{
                    height: ITEM_HEIGHT,
                    width: "fit-content",
                  }}
                  animate={{
                    y: wrappedDistance * ITEM_HEIGHT,
                    opacity: 1 - Math.abs(wrappedDistance) * 0.25,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 90,
                    damping: 22,
                    mass: 1,
                  }}
                  className="absolute flex items-center justify-start"
                >
                  <button
                    onClick={() => handleChipClick(index)}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    className={cn(
                      "relative flex items-center gap-4 px-6 md:px-10 lg:px-8 py-3.5 md:py-5 lg:py-4 rounded-full transition-all duration-700 text-left group border-[3px]",
                      isActive
                        ? "bg-dark text-white border-dark z-10 shadow-[4px_4px_0px_0px_var(--color-dark)] transform -translate-y-1"
                        : "bg-white text-dark border-dark hover:shadow-[4px_4px_0px_0px_var(--color-dark)] hover:-translate-y-1"
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center transition-colors duration-500",
                        isActive ? "text-accent" : "text-dark"
                      )}
                    >
                      {typeof feature.icon === 'string' ? (
                        <span className="text-xl leading-none">{feature.icon}</span>
                      ) : (
                        <HugeiconsIcon
                          icon={feature.icon as any}
                          size={18}
                          strokeWidth={2}
                        />
                      )}
                    </div>

                    <span className="font-bold text-sm md:text-[15px] tracking-tight whitespace-nowrap uppercase">
                      {feature.label}
                    </span>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 min-h-[500px] md:min-h-[600px] lg:h-full relative bg-white flex items-center justify-center py-16 md:py-24 lg:py-16 px-6 md:px-12 lg:px-10 overflow-hidden border-t-4 lg:border-t-0 lg:border-l-0 border-dark">
          <div className="relative w-full max-w-[420px] aspect-[4/5] flex items-center justify-center">
            {FEATURES.map((feature, index) => {
              const status = getCardStatus(index);
              const isActive = status === "active";
              const isPrev = status === "prev";
              const isNext = status === "next";

              return (
                <motion.div
                  key={feature.id}
                  initial={false}
                  animate={{
                    x: isActive ? 0 : isPrev ? -100 : isNext ? 100 : 0,
                    scale: isActive ? 1 : isPrev || isNext ? 0.85 : 0.7,
                    opacity: isActive ? 1 : isPrev || isNext ? 0.4 : 0,
                    rotate: isPrev ? -3 : isNext ? 3 : 0,
                    zIndex: isActive ? 20 : isPrev || isNext ? 10 : 0,
                    pointerEvents: isActive ? "auto" : "none",
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 25,
                    mass: 0.8,
                  }}
                  onClick={() => {
                    if (isActive && feature.link) {
                      if (feature.download) {
                        const a = document.createElement('a');
                        a.href = feature.link;
                        a.download = feature.link.split('/').pop() || '';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      } else {
                        window.open(feature.link, '_blank');
                      }
                    }
                  }}
                  className={cn(
                    "absolute inset-0 rounded-[2rem] md:rounded-[2.8rem] overflow-hidden border-4 border-dark bg-white shadow-[8px_8px_0px_0px_var(--color-dark)] origin-center transition-transform",
                    isActive && "cursor-pointer hover:scale-[1.02]"
                  )}
                >
                  <img
                    src={feature.image}
                    alt={feature.label}
                    className={cn(
                      "w-full h-full object-cover transition-all duration-700",
                      isActive
                        ? "grayscale-0 blur-0"
                        : "grayscale blur-[2px] brightness-75"
                    )}
                  />

                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute inset-x-0 bottom-0 p-10 pt-32 bg-gradient-to-t from-dark/90 via-dark/40 to-transparent flex flex-col justify-end pointer-events-none"
                      >
                        <div className="bg-accent text-dark px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] w-fit shadow-[2px_2px_0px_0px_var(--color-dark)] mb-3 border-2 border-dark">
                          {index + 1} • {feature.label}
                        </div>
                        <p className="text-white font-bold text-xl md:text-2xl leading-tight tracking-tight">
                          {feature.description}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div
                    className={cn(
                      "absolute top-8 left-8 flex items-center gap-3 transition-opacity duration-300",
                      isActive ? "opacity-100" : "opacity-0"
                    )}
                  >
                    <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_10px_var(--color-accent)] border border-dark" />
                    <span className="text-white/90 bg-dark/50 px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-[0.3em]">
                      {feature.tag}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeatureCarousel;
