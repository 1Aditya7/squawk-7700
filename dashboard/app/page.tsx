"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import MetricChart from "./components/MetricChart";
import StatusCard from "./components/StatusCard";

type Row = { time: number; altitude: number; thrust: number };
type Telemetry = { time:number; altitude:number; thrust:number; status:string; samples:number };

export default function HomePage() {
  const [data, setData] = useState<Row[]>([]);
  const [latest, setLatest] = useState<Telemetry | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("INIT");
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const connect = () => {
      try {
        const ws = new WebSocket("ws://127.0.0.1:8000/ws/telemetry");
        wsRef.current = ws;

        ws.onopen = () => {
          setLoading(false);
        };

        ws.onmessage = (evt) => {
          const msg: Telemetry = JSON.parse(evt.data);
          setLatest(msg);
          setStatus(msg.status || "ACTIVE");
          setData((prev) => [
            ...prev.slice(-120), // ~last 24s at 5Hz
            { time: msg.time, altitude: msg.altitude, thrust: msg.thrust },
          ]);
        };

        ws.onclose = () => {
          // try to reconnect after a short delay
          if (!reconnectTimer.current) {
            reconnectTimer.current = setTimeout(() => {
              reconnectTimer.current = null;
              connect();
            }, 1000);
          }
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch (e) {
        console.error("WS connect error", e);
      }
    };

    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, []);

  return (
    <main className="p-6 md:p-10">
      <header className="flex items-center justify-between mb-8">
        <motion.h1
          className="text-2xl md:text-3xl font-semibold tracking-wide"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          SQUAWK-7700 • Flight Telemetry
        </motion.h1>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-3"
        >
          <span
            className={`w-3 h-3 rounded-full ${
              status === "STABLE"
                ? "bg-emerald-400"
                : status === "DESCENT"
                ? "bg-yellow-400"
                : "bg-sky-400"
            } animate-pulse`}
          />
          <span className="text-sm opacity-80">Status: {status}</span>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="mb-3 text-lg font-medium">Altitude</h2>
            <MetricChart data={data} xKey="time" yKey="altitude" unit="m" loading={loading} />
          </div>
          <div className="card">
            <h2 className="mb-3 text-lg font-medium">Thrust</h2>
            <MetricChart data={data} xKey="time" yKey="thrust" unit="N" loading={loading} />
          </div>
        </div>

        <div className="space-y-6">
          <StatusCard title="Squawk Code" value="7700" accent="bg-rose-500" />
          <StatusCard title="Samples" value={String(data.length)} />
          <StatusCard title="Last Thrust" value={latest ? latest.thrust.toFixed(2) : "--"} unit="N" />
        </div>
      </div>
    </main>
  );
}
