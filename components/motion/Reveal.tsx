"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, ease: [0.22, 0.61, 0.36, 1] as const },
  },
};

export function ScrollReveal({ children, className = "", delay = 0 }: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 0.61, 0.36, 1] as const }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerReveal({ children, className = "" }: {
  children: ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={reduceMotion ? undefined : containerVariants}
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "visible"}
      viewport={{ once: true, amount: 0.12 }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className = "" }: {
  children: ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={reduceMotion ? undefined : itemVariants}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
