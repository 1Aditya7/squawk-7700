"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

export default function HUDParticles() {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const el = ref.current!;
    const dots = Array.from({ length: 18 }).map((_, i) => {
      const d = document.createElement("div");
      d.className = "absolute w-[2px] h-[2px] bg-emerald-300/50 rounded-full";
      d.style.left = Math.random() * 100 + "%";
      d.style.top = Math.random() * 100 + "%";
      el.appendChild(d);
      gsap.to(d, {
        y: `+=${40 + Math.random() * 40}`,
        x: `+=${(Math.random() - 0.5) * 60}`,
        opacity: 0.15 + Math.random() * 0.35,
        duration: 6 + Math.random() * 6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 2,
      });
      return d;
    });
    return () => dots.forEach(d => d.remove());
  }, []);
  return <div ref={ref} className="pointer-events-none fixed inset-0 z-0" />;
}
