"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.main
      key={pathname}
      className="flex-grow pt-[80px]"
      initial={
        prefersReducedMotion
          ? false
          : { opacity: 0, y: 14, filter: "blur(8px)" }
      }
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.main>
  );
}
