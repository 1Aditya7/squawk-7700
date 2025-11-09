"use client";

import NavBar from "./NavBar";
import MetricsMarquee from "./MetricsMarquee";
import StatusStrip from "./StatusStrip";
import MainGrid from "./MainGrid";
import RightPanel from "./RightPanel";
import FooterBar from "./FooterBar";

interface FlightDashboardLayoutProps {
  telemetry: any;
  history: any[];
  log: string[];
  triggerFault: (fault: string) => void;
}

export default function FlightDashboardLayout({
  telemetry,
  history,
  log,
  triggerFault,
}: FlightDashboardLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#1b1b1b] text-white">
      {/* === NAVBAR === */}
      <NavBar />

      {/* === MARQUEE BAR === */}
      <MetricsMarquee
        text={`System Status: ${telemetry?.status || "LOADING"} • Fault: ${
          telemetry?.fault || "NONE"
        }`}
      />

      {/* === STATUS STRIP === */}
      <StatusStrip telemetry={telemetry} />

      {/* === MAIN SECTION === */}
      <div className="flex flex-1 overflow-hidden">
        <MainGrid telemetry={telemetry} history={history} />
        <RightPanel log={log} triggerFault={triggerFault} />
      </div>

      {/* === FOOTER === */}
      <FooterBar />
    </div>
  );
}
