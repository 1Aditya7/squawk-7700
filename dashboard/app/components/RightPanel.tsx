"use client";
import { useState, useRef, useEffect } from "react";

interface RightPanelProps {
  log: string[];
  triggerFault: (fault: string) => void;
}

export default function RightPanel({ log, triggerFault }: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<
    "flight" | "fault" | "metrics" | "summary"
  >("flight");
  const scrollRef = useRef<HTMLDivElement>(null);

  const parsedLogs = log
    .map((l) => {
      try {
        return JSON.parse(l);
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .slice(0, 100);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [log]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "flight":
        return (
          <div
            ref={scrollRef}
            className="overflow-y-auto h-[60vh] font-mono text-xs text-black"
          >
            {parsedLogs.length === 0 ? (
              <p className="p-2 text-gray-500">No flight logs yet.</p>
            ) : (
              parsedLogs.map((entry: any, i: number) => {
                const time = new Date(entry.time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                const bg = i % 2 === 0 ? "bg-white" : "bg-gray-100";
                const isFault = entry.type === "FAULT";
                const titleColor = isFault ? "text-red-700" : "text-black";
                const delta = entry.deltaAlt ?? 0;
                const deltaColor =
                  delta < 0
                    ? "text-red-600"
                    : delta > 0
                    ? "text-green-600"
                    : "text-black";
                const deltaSymbol = delta > 0 ? "+" : delta < 0 ? "−" : "±";

                return (
                  <div
                    key={entry.id}
                    className={`border-b border-gray-300 p-2 ${bg}`}
                  >
                    <div className="flex justify-between">
                      <div
                        className={`font-semibold uppercase ${titleColor}`}
                      >
                        {isFault ? "✦ FAULT EVENT" : "• SYSTEM MESSAGE"}
                      </div>
                      <div className="text-gray-500 text-[10px]">{time}</div>
                    </div>

                    <div className="text-[11px] leading-snug mt-1 text-gray-700">
                      Altitude: {entry.altitude.toFixed(1)} m | Thrust:{" "}
                      {entry.thrust.toFixed(0)} N | Velocity:{" "}
                      {entry.velocity.toFixed(1)} m/s
                    </div>

                    <div className="font-bold mt-1 text-[11px]">
                      NET Δ:&nbsp;
                      <span className={deltaColor}>
                        {deltaSymbol}
                        {Math.abs(delta).toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        );

      case "fault":
        const faults = parsedLogs.filter((e: any) => e.type === "FAULT");
        return (
          <div
            ref={scrollRef}
            className="overflow-y-auto h-[60vh] font-mono text-xs text-red-700"
          >
            {faults.length === 0 ? (
              <p className="p-2 text-gray-500">No recorded fault events.</p>
            ) : (
              faults.map((f: any, i: number) => (
                <div
                  key={f.id}
                  className={`border-b border-gray-300 p-2 ${
                    i % 2 === 0 ? "bg-white" : "bg-gray-100"
                  }`}
                >
                  ⚠ Fault Detected: {f.fault} @{" "}
                  {new Date(f.time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  <div className="text-gray-700 text-[11px] mt-1">
                    Altitude {f.altitude.toFixed(1)} m | Thrust 
                    {f.thrust.toFixed(0)} N | Velocity 
                    {f.velocity.toFixed(1)} m/s
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case "metrics":
        return (
          <div className="overflow-y-auto h-[60vh] font-mono text-xs text-gray-800 bg-[#fafafa] p-2">
            <table className="w-full border-collapse">
              <thead className="border-b border-gray-400 text-gray-600">
                <tr>
                  <th align="left" className="pb-1">
                    Metric
                  </th>
                  <th align="right" className="pb-1">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>CPU Load</td>
                  <td align="right">13 %</td>
                </tr>
                <tr>
                  <td>GPU Temp</td>
                  <td align="right">57 °C</td>
                </tr>
                <tr>
                  <td>Latency</td>
                  <td align="right">23 ms</td>
                </tr>
              </tbody>
            </table>
          </div>
        );

      case "summary":
        return (
          <div className="overflow-y-auto h-[60vh] font-mono text-xs text-gray-900 bg-[#fafafa] p-2">
            <p>Mission stable. Recorded {parsedLogs.length} events.</p>
            <p>
              Detected faults: 
              {parsedLogs.filter((l: any) => l.type === "FAULT").length}
            </p>
            <p className="mt-2 text-gray-600">
              Next diagnostic cycle in T + 5 min.
            </p>
          </div>
        );
    }
  };

  const tabs = [
    { key: "flight", label: "FLIGHT LOG" },
    { key: "fault", label: "FAULT CONSOLE" },
    { key: "metrics", label: "SYSTEM METRICS" },
    { key: "summary", label: "MISSION SUMMARY" },
  ];

  return (
    <aside className="w-1/4 min-w-[320px] bg-[#f4f4f4] border-l border-gray-400 flex flex-col font-mono text-[13px] text-black">
      <div className="flex border-b border-gray-400 bg-[#fdfdfd]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 py-2 px-1 text-xs uppercase font-semibold tracking-wide ${
              activeTab === tab.key
                ? "bg-[#fff] text-black border-b-2 border-black"
                : "bg-[#f4f4f4] text-gray-500 hover:text-black"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 border-b border-gray-300">{renderTabContent()}</div>

      <div className="p-3 border-t border-gray-400 bg-[#fdfdfd]">
        <div className="uppercase text-[11px] text-gray-600 mb-1 font-semibold">
          Manual Fault Injection
        </div>
        <div className="flex flex-wrap gap-2">
          {["ENGINE_LOSS", "SENSOR_DRIFT", "CONTROL_LOCK"].map((f) => (
            <button
              key={f}
              onClick={() => triggerFault(f)}
              className="px-2 py-1 border border-gray-600 text-[11px] text-gray-800 hover:bg-gray-200 transition"
            >
              {f}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
