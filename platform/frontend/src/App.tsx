import { motion } from "framer-motion";
import { Activity, DatabaseZap, RadioTower } from "lucide-react";
import { AuthPanel } from "./features/auth/AuthPanel";
import { AnalyticsCharts } from "./features/dashboard/AnalyticsCharts";
import { StatsGrid } from "./features/dashboard/StatsGrid";
import { FocusConsole } from "./features/focus/FocusConsole";
import { LeaderboardTable } from "./features/leaderboard/LeaderboardTable";
import { RoomPresence } from "./features/rooms/RoomPresence";

export function App() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-primary">
            <RadioTower size={16} />
            Distributed productivity analytics
          </div>
          <h1 className="text-3xl font-semibold tracking-normal md:text-5xl">FocusLoop Platform</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
            Real-time focus tracking, Redis leaderboards, Kafka analytics projections, and observability-first backend
            architecture for engineering-focused productivity teams.
          </p>
        </div>
        <div className="flex gap-2 rounded-lg border border-border bg-card p-2 text-sm text-slate-300">
          <span className="flex items-center gap-2 px-2"><DatabaseZap size={15} /> Redis</span>
          <span className="flex items-center gap-2 px-2"><Activity size={15} /> Kafka</span>
        </div>
      </header>

      <StatsGrid />

      <section className="grid gap-4 lg:grid-cols-3">
        <motion.div className="lg:col-span-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <FocusConsole />
        </motion.div>
        <AuthPanel />
      </section>

      <AnalyticsCharts />

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LeaderboardTable />
        </div>
        <RoomPresence />
      </section>
    </main>
  );
}
