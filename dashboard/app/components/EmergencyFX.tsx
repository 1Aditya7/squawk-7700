"use client";
import { useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { motion } from "framer-motion";

export default function EmergencyFX({ active }: { active: boolean }) {
  useGSAP(() => {
    if (!active) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hud-pulse",
        { boxShadow: "0 0 0 0 rgba(239,68,68,0.0)" },
        { boxShadow: "0 0 40px 6px rgba(239,68,68,0.35)",
          duration: .6, ease: "sine.inOut", yoyo: true, repeat: -1 }
      );
      gsap.fromTo(
        "main",
        { x: 0 },
        { x: 2, duration: .06, ease: "power2.inOut", yoyo: true, repeat: 8 }
      );
    });
    return () => ctx.revert();
  }, [active]);

  if (!active) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: .14 }}
      className="pointer-events-none fixed inset-0 z-40 bg-red-500"
      style={{ mixBlendMode: "soft-light" }}
    />
  );
}
