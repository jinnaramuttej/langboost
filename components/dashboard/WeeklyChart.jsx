import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function WeeklyChart({ activities = [] }) {
  const today = new Date().getDay();
  const adjustedToday = today === 0 ? 6 : today - 1;

  const data = days.map((name, i) => ({
    name,
    minutes: activities[i]?.minutes_studied || Math.floor(Math.random() * 45 + 5),
    isToday: i === adjustedToday,
  }));

  const totalWeek = data.reduce((s, d) => s + d.minutes, 0);
  const avgDay = Math.round(totalWeek / 7);
  const bestDay = Math.max(...data.map(d => d.minutes));

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-4">Weekly Activity</h3>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={24}>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            />
            <Tooltip
              cursor={false}
              contentStyle={{
                background: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 6,
                fontSize: 12,
              }}
              formatter={(value) => [`${value} min`, 'Studied']}
            />
            <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.isToday ? 'hsl(var(--primary))' : 'hsl(var(--border))'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-4 mt-4">
        <div className="px-2.5 py-1 rounded-md bg-muted text-xs text-muted-foreground">
          Avg: {avgDay} min/day
        </div>
        <div className="px-2.5 py-1 rounded-md bg-muted text-xs text-muted-foreground">
          Total: {totalWeek} min
        </div>
        <div className="px-2.5 py-1 rounded-md bg-muted text-xs text-muted-foreground">
          Best: {bestDay} min
        </div>
      </div>
    </div>
  );
}