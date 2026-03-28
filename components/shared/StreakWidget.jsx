import React from 'react';
import { Flame } from 'lucide-react';

export default function StreakWidget({ streak = 0, compact = false }) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const today = new Date().getDay();
  const adjustedToday = today === 0 ? 6 : today - 1;

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-sm">
        <Flame className="w-4 h-4 text-primary" />
        <span className="font-semibold text-foreground">{streak}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Flame className="w-5 h-5 text-primary" />
      <span className="font-semibold text-foreground">{streak} days</span>
      <div className="flex gap-1">
        {days.map((day, i) => (
          <div
            key={i}
            className={`w-5 h-5 rounded-sm flex items-center justify-center text-[10px] font-medium
              ${i < adjustedToday && i >= adjustedToday - streak
                ? 'bg-primary/20 text-primary'
                : i === adjustedToday
                  ? 'bg-primary/10 text-primary border border-primary/30'
                  : 'bg-muted text-muted-foreground'
              }`}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
}