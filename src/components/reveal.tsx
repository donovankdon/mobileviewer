"use client";

import { motion, useInView } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "span" | "h1" | "h2" | "p";
}

// Scroll-triggered reveal for below-fold content. Slides up + fades.
export function Reveal({ children, delay = 0, y = 16, className, as = "div" }: RevealProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const MotionTag = motion[as] as typeof motion.div;
  return (
    <MotionTag
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </MotionTag>
  );
}

interface WordRevealProps {
  text: string;
  className?: string;
  delay?: number;
}

// Word-by-word reveal for big headlines. Triggers immediately on mount
// (intended for above-the-fold copy).
export function WordReveal({ text, className, delay = 0 }: WordRevealProps) {
  const words = text.split(" ");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <span className={className} style={{ display: "inline-block" }}>
      {words.map((w, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            overflow: "hidden",
            verticalAlign: "bottom",
            paddingBottom: "0.18em",
            marginRight: i < words.length - 1 ? "0.28em" : 0,
          }}
        >
          <motion.span
            style={{ display: "inline-block" }}
            initial={{ y: "110%" }}
            animate={mounted ? { y: 0 } : { y: "110%" }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: delay + i * 0.07 }}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
