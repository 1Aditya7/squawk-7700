import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "SQUAWK-7700 • Flight Telemetry",
  description: "Real-time simulation dashboard for eVTOL test systems",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
