// Animációs utility komponensek framer-motion-mal

import { motion } from "framer-motion";
import type React from "react";
import type { ReactNode } from "react";

// Fade-in animáció
export const FadeIn = ({ children, delay = 0, duration = 0.5 }: { children: ReactNode; delay?: number; duration?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration, delay, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

// Slide-in animáció
export const SlideIn = ({ children, direction = "left", delay = 0, duration = 0.5 }: { 
  children: ReactNode; 
  direction?: "left" | "right" | "up" | "down";
  delay?: number;
  duration?: number;
}) => {
  const variants = {
    left: { x: -50, y: 0 },
    right: { x: 50, y: 0 },
    up: { x: 0, y: -50 },
    down: { x: 0, y: 50 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...variants[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

// Scale-in animáció
export const ScaleIn = ({ children, delay = 0, duration = 0.5 }: { children: ReactNode; delay?: number; duration?: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration, delay, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

// Stagger children animáció
export const StaggerContainer = ({ children, delay = 0.1 }: { children: ReactNode; delay?: number }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={{
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: delay,
        },
      },
    }}
  >
    {children}
  </motion.div>
);

// Stagger item
export const StaggerItem = ({ children }: { children: ReactNode }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    }}
  >
    {children}
  </motion.div>
);

// Hover lift animáció
export const HoverLift = ({
  children,
  style,
  className,
  onClick,
  onMouseEnter,
  onMouseLeave,
  intensity = "expressive",
  disabled = false,
}: {
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseEnter?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLDivElement>) => void;
  intensity?: "subtle" | "expressive" | "playful";
  disabled?: boolean;
}) => {
  const mapping = {
    subtle: { hover: { y: -3, scale: 1.015, rotate: 0 }, tap: { scale: 0.99 }, transition: { stiffness: 260, damping: 20 } },
    expressive: { hover: { y: -6, scale: 1.05, rotate: 0 }, tap: { scale: 0.97 }, transition: { stiffness: 240, damping: 18 } },
    playful: { hover: { y: -8, scale: 1.08, rotate: 0.6 }, tap: { scale: 0.95 }, transition: { stiffness: 220, damping: 16 } },
  } as const;
  const config = mapping[intensity] ?? mapping.expressive;

  return (
    <motion.div
      whileHover={disabled ? undefined : config.hover}
      whileTap={disabled ? undefined : config.tap}
      transition={
        disabled
          ? undefined
          : { type: "spring", stiffness: config.transition.stiffness, damping: config.transition.damping, mass: intensity === "playful" ? 0.75 : 1 }
      }
      style={style}
      className={className}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </motion.div>
  );
};

// Pulse animáció
export const Pulse = ({ children }: { children: ReactNode }) => (
  <motion.div
    animate={{ scale: [1, 1.05, 1] }}
    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
  >
    {children}
  </motion.div>
);

// Rotate animáció
export const Rotate = ({ children, duration = 2 }: { children: ReactNode; duration?: number }) => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration, repeat: Infinity, ease: "linear" }}
  >
    {children}
  </motion.div>
);

// Shake animáció
export const Shake = ({ children }: { children: ReactNode }) => (
  <motion.div
    animate={{ x: [0, -10, 10, -10, 10, 0] }}
    transition={{ duration: 0.5 }}
  >
    {children}
  </motion.div>
);

// Bounce animáció
export const Bounce = ({ children }: { children: ReactNode }) => (
  <motion.div
    animate={{ y: [0, -10, 0] }}
    transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
  >
    {children}
  </motion.div>
);

