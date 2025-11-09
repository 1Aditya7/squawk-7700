"use client";
type Props = { text: string };
export default function MetricsMarquee({ text }: Props) {
  return (
    <div className="bg-rose-600 py-1 px-4 text-black text-center text-sm font-medium tracking-wide animate-pulse">
      {text}
    </div>
  );
}
