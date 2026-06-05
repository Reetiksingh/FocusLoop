import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "../../components/ui/card";

const weekly = [
  { day: "Mon", hours: 4.5, quality: 86 },
  { day: "Tue", hours: 6.2, quality: 92 },
  { day: "Wed", hours: 5.1, quality: 88 },
  { day: "Thu", hours: 7.4, quality: 94 },
  { day: "Fri", hours: 3.6, quality: 81 },
  { day: "Sat", hours: 2.8, quality: 78 },
  { day: "Sun", hours: 5.8, quality: 90 }
];

export function AnalyticsCharts() {
  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <Card className="p-4 lg:col-span-3">
        <div className="mb-4">
          <h2 className="text-base font-semibold">Productivity trend</h2>
          <p className="text-sm text-slate-400">Weekly focus duration blended with integrity scoring.</p>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weekly}>
              <CartesianGrid stroke="rgba(148,163,184,.16)" />
              <XAxis dataKey="day" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
              <Area type="monotone" dataKey="hours" stroke="#2dd4bf" fill="#2dd4bf" fillOpacity={0.22} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card className="p-4 lg:col-span-2">
        <div className="mb-4">
          <h2 className="text-base font-semibold">Quality by day</h2>
          <p className="text-sm text-slate-400">Idle time, switching, and interruptions reduce score.</p>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekly}>
              <CartesianGrid stroke="rgba(148,163,184,.16)" />
              <XAxis dataKey="day" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
              <Bar dataKey="quality" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
