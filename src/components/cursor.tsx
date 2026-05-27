"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

// Blend-mode cursor: tiny dot + ring that lags behind, inverts colors over content.
// Hides on touch devices and respects reduced-motion.
export function Cursor() {
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  const ringX = useSpring(dotX, { stiffness: 250, damping: 28, mass: 0.6 });
  const ringY = useSpring(dotY, { stiffness: 250, damping: 28, mass: 0.6 });

  const ringScale = useMotionValue(1);
  const scaleSpring = useSpring(ringScale, { stiffness: 300, damping: 22 });

  const hoveredRef = useRef(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduceMotion) return;

    document.body.classList.add("has-custom-cursor");

    const move = (e: PointerEvent) => {
      dotX.set(e.clientX);
      dotY.set(e.clientY);

      const t = e.target as Element | null;
      const interactive = !!t?.closest("button, a, input, [data-magnetic], iframe");
      if (interactive !== hoveredRef.current) {
        hoveredRef.current = interactive;
        ringScale.set(interactive ? 2.2 : 1);
      }
    };

    const leave = () => {
      dotX.set(-100);
      dotY.set(-100);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerleave", leave);
      document.body.classList.remove("has-custom-cursor");
    };
  }, [dotX, dotY, ringScale]);

  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[100] h-1.5 w-1.5 rounded-full bg-white"
        style={{ x: dotX, y: dotY, translateX: "-50%", translateY: "-50%", mixBlendMode: "difference" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[100] h-8 w-8 rounded-full border border-white"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
          scale: scaleSpring,
          mixBlendMode: "difference",
        }}
      />
    </>
  );
}
