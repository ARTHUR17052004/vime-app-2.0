"use client";

import { motion } from "framer-motion";

export default function FadeIn({
  children,
  delay = 0,
  y = 20,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.45,
        delay,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}