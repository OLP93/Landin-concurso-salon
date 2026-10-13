import { useEffect, useState } from "react";

export function Countdown({ target, label }: { target: string; label: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, new Date(target).getTime() - now);
  const parts = [
    ["días", Math.floor(diff / 86400000)],
    ["horas", Math.floor(diff / 3600000) % 24],
    ["min", Math.floor(diff / 60000) % 60],
    ["seg", Math.floor(diff / 1000) % 60],
  ] as const;
  return (
    <div aria-label={label}>
      <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <div className="flex gap-2" role="timer" aria-live="off">
        {parts.map(([l, v]) => (
          <div key={l} className="min-w-16 rounded-2xl border bg-card px-3 py-2 text-center shadow-card">
            <div className="font-display text-3xl font-semibold tabular-nums">{String(v).padStart(2, "0")}</div>
            <div className="text-xs text-muted-foreground">{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
