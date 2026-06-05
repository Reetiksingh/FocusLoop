import { motion } from "framer-motion";
import { Activity, Flame, Gauge, Timer } from "lucide-react";
import { Card } from "../../components/ui/card";

const stats = [
  { label: "Focused today", value: "6.4h", icon: Timer, tone: "text-primary" },
  { label: "Quality score", value: "91", icon: Gauge, tone: "text-accent" },
  { label: "Active streak", value: "18d", icon: Flame, tone: "text-success" },
  { label: "Kafka lag", value: "12ms", icon: Activity, tone: "text-slate-300" }
];

export function StatsGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.06 }}
        >
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">{stat.label}</span>
              <stat.icon className={stat.tone} size={18} />
            </div>
            <div className="mt-3 text-3xl font-semibold">{stat.value}</div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
