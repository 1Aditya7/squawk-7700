"use client";
import MetricChart from "./MetricChart";

type Props = { telemetry: any; history: any[] };
export default function MainGrid({ telemetry, history }: Props) {
  return (
    <div className="flex-1 grid grid-cols-[1fr_auto_1fr] grid-rows-2 gap-2 p-3 bg-gray-800 overflow-y-auto">
      <div className="bg-gray-700 rounded-lg p-2"><MetricChart data={history} xKey="time" yKey="altitude" unit="m" /></div>
      <div className="flex items-center justify-center bg-gray-700 rounded-lg text-center text-sm">
        <div>
          <div className="text-gray-400">Speed / RPM</div>
          <div className="text-2xl font-bold">{telemetry?.velocity?.toFixed(1) ?? "--"}</div>
        </div>
      </div>
      <div className="bg-gray-700 rounded-lg p-2"><MetricChart data={history} xKey="time" yKey="velocity" unit="m/s" /></div>
      <div className="bg-gray-700 rounded-lg p-2"><MetricChart data={history} xKey="time" yKey="thrust" unit="N" /></div>
      <div className="bg-gray-700 rounded-lg p-2"><MetricChart data={history} xKey="time" yKey="acceleration" unit="m/s²" /></div>
    </div>
  );
}
