"use client";
import { useState } from "react";

export default function ControlPanel() {
  const [setpoint, setSetpoint] = useState(1100);

  const sendSetpoint = async (val: number) => {
    setSetpoint(val);
    await fetch("http://127.0.0.1:8000/setpoint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: val }),
    });
  };

  const injectFault = async (type: string) => {
    await fetch(`http://127.0.0.1:8000/trigger_fault/${type}`, { method: "POST" });
  };

  return (
    <div className="card space-y-3">
      <h2 className="text-lg font-medium">Manual Controls</h2>
      <div>
        <label className="block text-sm mb-1">Setpoint: {setpoint} m</label>
        <input
          type="range"
          min="800"
          max="1500"
          value={setpoint}
          onChange={(e) => sendSetpoint(Number(e.target.value))}
          className="w-full accent-emerald-500"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {["ENGINE_LOSS", "SENSOR_DRIFT", "CONTROL_LOCK"].map((f) => (
          <button
            key={f}
            onClick={() => injectFault(f)}
            className="py-2 text-xs font-semibold bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition"
          >
            {f.replace("_", " ")}
          </button>
        ))}
      </div>
    </div>
  );
}
