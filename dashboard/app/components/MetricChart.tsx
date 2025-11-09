"use client";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function MetricChart({
  data,
  xKey,
  yKey,
  unit,
  loading,
}: {
  data: any[];
  xKey: string;
  yKey: string;
  unit?: string;
  loading?: boolean;
}) {
  if (loading)
    return <div className="h-60 flex items-center justify-center opacity-70">Loading…</div>;
  if (!data?.length)
    return <div className="h-60 flex items-center justify-center opacity-70">No data</div>;

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="4 4" stroke="#1f2a48" />
          <XAxis
              dataKey="time"
              tickFormatter={(t) => (t - (data[0]?.time ?? t)).toFixed(1)}
              label={{ value: "Time (s)", position: "insideBottomRight", offset: -5 }}
          />
          <YAxis stroke="#7c8db5" />
          <Tooltip
            contentStyle={{ background: "#0b1220", border: "1px solid #1f2a48", color: "#e6eefc" }}
            labelStyle={{ color: "#9fb2e0" }}
            formatter={(v: any) => [`${v}${unit ?? ""}`, yKey]}
          />
          <Line type="monotone" dataKey={yKey} dot={false} stroke="#7aa2ff" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
