"use client";

import { useEffect, useState, useRef } from "react";
import HUDParticles from "./components/HUDParticles";
import EmergencyFX from "./components/EmergencyFX";
import StartupOverlay from "./components/StartupOverlay";
import FlightDashboardLayout from "./components/FlightDashboardLayout";

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

type LogEntry = {
  id: string;
  time: number;
  type: "FAULT" | "INFO";
  status: string;
  fault: string;
  altitude: number;
  thrust: number;
  velocity: number;
  deltaAlt: number;
};

export default function Dashboard() {
  const [armed, setArmed] = useState(false);
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
  const [history, setHistory] = useState<Telemetry[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  // Store last snapshot info
  const latestSnapshot = useRef<Telemetry | null>(null);
  const lastLogTime = useRef<number>(0);
  const LOG_INTERVAL = 5000; // 5 seconds

  useEffect(() => {
    const ws = new WebSocket("ws://127.0.0.1:8000/ws/telemetry");
    wsRef.current = ws;

    ws.onmessage = (evt) => {
      const data: Telemetry = JSON.parse(evt.data);
      setTelemetry(data);
      setHistory((prev) => [...prev.slice(-100), data]);

      const now = Date.now();
      const isFault = data.status === "EMERGENCY" || data.fault !== "NONE";

      if (now - lastLogTime.current >= LOG_INTERVAL) {
        const prevAlt = latestSnapshot.current?.altitude ?? data.altitude;
        const snapshot: LogEntry = {
          id: crypto.randomUUID(),
          time: now,
          type: isFault ? "FAULT" : "INFO",
          status: data.status,
          fault: data.fault,
          altitude: data.altitude,
          thrust: data.thrust,
          velocity: data.velocity,
          deltaAlt: data.altitude - prevAlt,
        };

        setLog((prev) => [JSON.stringify(snapshot), ...prev.slice(0, 99)]);
        lastLogTime.current = now;
        latestSnapshot.current = data;
      }
    };

    ws.onerror = (e) => console.error("WebSocket error:", e);
    ws.onclose = () => console.warn("Telemetry socket closed");

    return () => ws.close();
  }, []);

  const triggerFault = async (fault: string) => {
    await fetch(`http://127.0.0.1:8000/trigger_fault/${fault}`, { method: "POST" });

    const snapshot: LogEntry = {
      id: crypto.randomUUID(),
      time: Date.now(),
      type: "FAULT",
      status: "MANUAL_FAULT",
      fault,
      altitude: telemetry?.altitude ?? 0,
      thrust: telemetry?.thrust ?? 0,
      velocity: telemetry?.velocity ?? 0,
      deltaAlt: 0,
    };

    setLog((prev) => [JSON.stringify(snapshot), ...prev.slice(0, 99)]);
  };

  return (
    <>
      <StartupOverlay armed={armed} setArmed={setArmed} />
      <HUDParticles />
      <EmergencyFX active={telemetry?.status === "EMERGENCY"} />

      {armed && (
        <FlightDashboardLayout
          telemetry={telemetry}
          history={history}
          log={log}
          triggerFault={triggerFault}
        />
      )}
    </>
  );
}
