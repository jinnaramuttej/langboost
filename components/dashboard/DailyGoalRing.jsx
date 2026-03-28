import React from 'react';

export default function DailyGoalRing({ minutesStudied = 0, goal = 15 }) {
  const pct = Math.min(100, Math.round((minutesStudied / goal) * 100));
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="rounded-lg border border-border bg-card p-5 flex flex-col items-center">
      <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-4 self-start">Daily Goal</h3>
      <div className="relative w-40 h-40">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 144 144">
          <circle
            cx="72" cy="72" r={radius}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="6"
          />
          <circle
            cx="72" cy="72" r={radius}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-syne font-bold text-2xl text-foreground">{pct}%</span>
          <span className="text-xs text-muted-foreground">of daily goal</span>
        </div>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        {minutesStudied} min / {goal} min goal
      </p>
    </div>
  );
}