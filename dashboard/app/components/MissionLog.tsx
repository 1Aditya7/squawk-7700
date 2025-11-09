"use client";
import { motion } from "framer-motion";

export default function MissionLog({ entries }: { entries: string[] }) {
  return (
    <div className="card h-64 overflow-y-auto">
      <h2 className="text-lg font-medium mb-3">Mission Log</h2>
      <ul className="space-y-1 text-sm">
        {entries.map((e, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="opacity-80"
          >
            {e}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
