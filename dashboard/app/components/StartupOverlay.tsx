"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";

export default function StartupOverlay({
  armed,
  setArmed,
}: {
  armed: boolean;
  setArmed: (v: boolean) => void;
}) {
  const [bootProgress, setBootProgress] = useState(0);

  // Simulate progressive boot text animation + fallback auto-arm
  useEffect(() => {
    let t: ReturnType<typeof setInterval>;
    let p = 0;
    t = setInterval(() => {
      p += Math.random() * 12;
      if (p >= 100) {
        clearInterval(t);
        setTimeout(() => setArmed(true), 600);
      }
      setBootProgress(Math.min(100, p));
    }, 200);

    const fallback = setTimeout(() => setArmed(true), 5000);
    return () => {
      clearInterval(t);
      clearTimeout(fallback);
    };
  }, [setArmed]);

  // Subtle glow pulse while loading
  useEffect(() => {
  if (!armed) {
      const tl = gsap.timeline({ repeat: -1, yoyo: true });
      tl.to(".boot-title", { opacity: 0.6, duration: 1.2 });

      return () => {
        tl.kill();
      };
    }
  }, [armed]);

  return (
    <AnimatePresence>
      {!armed && (
        <motion.div
          key="boot"
          className="fixed inset-0 flex flex-col items-center justify-center bg-black z-[9999]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        >
          <motion.p
            className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-4"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            System Boot
          </motion.p>

          <motion.h1
            className="boot-title text-5xl sm:text-6xl font-bold text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <span className="text-emerald-400">SQUAWK</span>
            <span className="text-gray-200">-7700</span>
          </motion.h1>

          <motion.p
            className="mt-3 text-sm text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
          >
            Real-time Flight Telemetry Console
          </motion.p>

          <motion.div
            className="w-64 mt-8 h-[2px] bg-gradient-to-r from-emerald-400/30 via-sky-400/50 to-transparent rounded-full overflow-hidden"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 2.0, duration: 1.2 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-400 to-sky-400"
              initial={{ width: "0%" }}
              animate={{ width: `${bootProgress}%` }}
              transition={{ ease: "linear", duration: 0.2 }}
            />
          </motion.div>

          <motion.p
            className="mt-2 text-xs text-gray-500 tracking-wider"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
          >
            Initializing telemetry... {bootProgress.toFixed(0)}%
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
