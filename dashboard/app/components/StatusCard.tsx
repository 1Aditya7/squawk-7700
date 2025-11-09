"use client";
import { motion } from "framer-motion";

export default function StatusCard({
  title,
  value,
  unit,
  accent,
}: {
  title: string;
  value: string;
  unit?: string;
  accent?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex items-center justify-between">
        <div className="text-sm opacity-70">{title}</div>
        <div className={`w-2 h-2 rounded-full ${accent ?? "bg-sky-500"}`} />
      </div>
      <div className="mt-2 text-3xl font-semibold tracking-wide">
        {value}
        {unit ? <span className="text-base opacity-60 ml-1">{unit}</span> : null}
      </div>
    </motion.div>
  );
}
