"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import HUDParticles from "./components/HUDParticles";
import EmergencyFX from "./components/EmergencyFX";
import StartupOverlay from "./components/StartupOverlay";
import MetricChart from "./components/MetricChart";
import StatusCard from "./components/StatusCard";
import TickerBar from "./components/TickerBar";
import MissionLog from "./components/MissionLog";

type Telemetry = {
  time: number;
  altitude: number;
  thrust: number;
  velocity: number;
  acceleration: number;
  error: number;
  status: string;
  fault: string;
};

export default function Dashboard() {
  const [armed, setArmed] = useState(false);
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
  const [history, setHistory] = useState<Telemetry[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  // 🔌 WebSocket Connection
  useEffect(() => {
    const ws = new WebSocket("ws://127.0.0.1:8000/ws/telemetry");
    wsRef.current = ws;

    ws.onmessage = (evt) => {
      const data: Telemetry = JSON.parse(evt.data);
      setTelemetry(data);
      setHistory((prev) => [...prev.slice(-100), data]);

      if (data.status === "EMERGENCY")
        setLog((prev) => [`⚠️ Fault Detected: ${data.fault}`, ...prev]);
      else if (data.status === "STABLE")
        setLog((prev) => [`✅ System Stable at ${data.altitude.toFixed(1)}m`, ...prev]);
    };

    ws.onerror = (e) => console.error("WebSocket error:", e);
    ws.onclose = () => console.warn("Telemetry socket closed");

    return () => ws.close();
  }, []);

  // 🧭 Fault trigger API
  const triggerFault = async (fault: string) => {
    await fetch(`http://127.0.0.1:8000/trigger_fault/${fault}`, { method: "POST" });
    setLog((prev) => [`🔧 Fault injected: ${fault}`, ...prev]);
  };

  return (
    <>
      <StartupOverlay armed={armed} setArmed={setArmed} />
      <HUDParticles />
      <EmergencyFX active={telemetry?.status === "EMERGENCY"} />

      {armed && (
        <main className="relative z-10 p-8 space-y-6">
          <TickerBar text={`System Status: ${telemetry?.status || "LOADING"} • Fault: ${telemetry?.fault || "NONE"}`} />

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="card">
                <h2 className="text-lg font-semibold mb-2 text-accent">Altitude</h2>
                <MetricChart data={history} xKey="time" yKey="altitude" unit="m" />
              </div>
              <div className="card">
                <h2 className="text-lg font-semibold mb-2 text-accent">Thrust</h2>
                <MetricChart data={history} xKey="time" yKey="thrust" unit="N" />
              </div>
            </div>

            <div className="space-y-4">
              <StatusCard title="Squawk Code" value="7700" accent="bg-rose-500" />
              <StatusCard title="Altitude" value={telemetry?.altitude.toFixed(1) ?? "--"} unit="m" />
              <StatusCard title="Velocity" value={telemetry?.velocity.toFixed(2) ?? "--"} unit="m/s" />
              <StatusCard title="Thrust" value={telemetry?.thrust.toFixed(1) ?? "--"} unit="N" />
              <StatusCard title="Status" value={telemetry?.status ?? "--"} />
              <StatusCard title="Fault" value={telemetry?.fault ?? "NONE"} />
            </div>
          </section>

          <section className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <MissionLog entries={log} />

            <div className="card flex flex-col gap-3">
              <h3 className="text-accent text-sm uppercase tracking-wide">Manual Fault Injection</h3>
              <div className="flex gap-2">
                {["ENGINE_LOSS", "SENSOR_DRIFT", "CONTROL_LOCK"].map((f) => (
                  <button
                    key={f}
                    onClick={() => triggerFault(f)}
                    className="px-3 py-1.5 bg-rose-500/10 border border-rose-400/30 hover:bg-rose-500/20 rounded-lg text-xs text-rose-300 transition"
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </main>
      )}
    </>
  );
}
