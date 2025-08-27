"use client";

import { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";

interface CountUpProps {
  to: number;
  duration?: number;
  suffix?: string;
  decimals?: number;
}

export function CountUp({ to, duration = 2, suffix = "", decimals = 0 }: CountUpProps) {
  const controls = useAnimation();
  const [count, setCount] = useState(0);

  useEffect(() => {
    controls.start({
      x: to,
      transition: { duration, ease: "easeOut" },
    });
  }, [to, duration, controls]);

  return (
    <motion.span
      initial={{ x: 0 }}
      animate={controls}
      onUpdate={(latest: any) => {
        setCount(Number(parseFloat(latest.x).toFixed(decimals)));
      }}
    >
      {count}
      {suffix}
    </motion.span>
  );
}
