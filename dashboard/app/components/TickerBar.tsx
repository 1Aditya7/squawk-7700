"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function TickerBar({ latest }: any) {
  const track = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const el = track.current!;
    const tl = gsap.timeline({ repeat: -1 });
    tl.fromTo(el, { x: 0 }, { x: -400, duration: 6, ease: "none" });
    return () => tl.kill();
  }, []);

  const status = latest?.status ?? "INIT";
  const color =
    status === "STABLE" ? "text-emerald-400" :
    status === "DESCENT" ? "text-yellow-400" : "text-sky-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative z-30 w-full bg-[#0a0a0a]/80 backdrop-blur border-b border-gray-800"
    >
      <div className="mx-auto max-w-[1400px] py-3 px-6 overflow-hidden">
        <div className="flex items-center gap-4">
          <span className={`font-semibold ${color}`}>SQUAWK-7700</span>
          <div className="relative w-full overflow-hidden">
            <div ref={track} className="flex gap-10 whitespace-nowrap text-sm opacity-80">
              <span>STATUS: {status}</span>
              <span>FAULT: {latest?.fault ?? "NONE"}</span>
              <span>ALT: {latest?.altitude?.toFixed(1) ?? "--"} m</span>
              <span>VEL: {latest?.velocity?.toFixed(2) ?? "--"} m/s</span>
              <span>THRUST: {latest?.thrust?.toFixed(1) ?? "--"} N</span>
              <span>ERROR: {latest?.error?.toFixed(2) ?? "--"} m</span>
              {/* duplicate chunk for seamless loop */}
              <span>STATUS: {status}</span>
              <span>FAULT: {latest?.fault ?? "NONE"}</span>
              <span>ALT: {latest?.altitude?.toFixed(1) ?? "--"} m</span>
              <span>VEL: {latest?.velocity?.toFixed(2) ?? "--"} m/s</span>
              <span>THRUST: {latest?.thrust?.toFixed(1) ?? "--"} N</span>
              <span>ERROR: {latest?.error?.toFixed(2) ?? "--"} m</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
