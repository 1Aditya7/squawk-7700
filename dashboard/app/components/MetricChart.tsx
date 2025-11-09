"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

export default function MetricChart({ title, data, yKey, unit }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: .35, ease: "easeOut" }}
      className="w-full h-56 relative hud-glow overflow-hidden"
    >
      <h2 className="text-xs uppercase tracking-wider text-gray-400 mb-1 px-2 pt-2">{title}</h2>

      {/* moving sheen */}
      <motion.div
        initial={{ x: "-30%" }}
        animate={{ x: "130%" }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 h-full w-[18%] bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"
      />

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="time" hide />
          <YAxis hide />
          <Tooltip contentStyle={{ backgroundColor: "#0b0b0b", border: "1px solid #222" }}
                   labelFormatter={() => ""} formatter={(v:any)=>[v, unit]} />
          <Line type="monotone" dataKey={yKey} stroke="url(#grad)"
                strokeWidth={2} dot={false} isAnimationActive={false} />
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.95}/>
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.35}/>
            </linearGradient>
          </defs>
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
