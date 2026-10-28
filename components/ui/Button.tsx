"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import Link from "next/link";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "gold";
  href?: string;
}

export function Button({ className, variant = "primary", href, children, ...props }: ButtonProps) {
  const reduceMotion = useReducedMotion();
  const styles = cn(
    "inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium tracking-wide transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
    variant === "primary" && "bg-primary text-white hover:bg-primary-dark",
    variant === "secondary" && "bg-soft-pink text-primary hover:bg-[#f3d0db]",
    variant === "ghost" && "border border-primary/20 bg-white text-primary hover:border-primary/40",
    variant === "gold" && "bg-accent text-ink hover:brightness-95",
    className,
  );

  if (href) {
    return (
      <motion.div whileHover={reduceMotion ? undefined : { y: -1 }} whileTap={reduceMotion ? undefined : { scale: 0.98 }} transition={{ duration: 0.18 }} className="inline-flex">
        <Link href={href} className={styles}>
          {children}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      className={styles}
      whileHover={reduceMotion || props.disabled ? undefined : { y: -1 }}
      whileTap={reduceMotion || props.disabled ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.18 }}
      {...props}
    >
        {children}
    </motion.button>
  );
}
