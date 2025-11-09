"use client";
type Props = { telemetry: any };
export default function StatusStrip({ telemetry }: Props) {
  return (
    <div className="flex justify-around bg-gray-900 py-2 border-b border-gray-700 text-xs uppercase tracking-wide">
      <span>Overall: {telemetry?.status ?? "--"}</span>
      <span>Engine: {telemetry?.fault ? "FAULT" : "NOMINAL"}</span>
      <span>Power: {telemetry?.thrust?.toFixed(1) ?? "--"} N</span>
      <span>Altitude: {telemetry?.altitude?.toFixed(1) ?? "--"} m</span>
    </div>
  );
}
