import { FocusPanel } from "./components/FocusPanel";
import { PlanningPanel } from "./components/PlanningPanel";
import { ReflectionPanel } from "./components/ReflectionPanel";
import { StatsHeader } from "./components/StatsHeader";

export function App() {
  return (
    <main>
      <StatsHeader />
      <section>
        <PlanningPanel />
        <ReflectionPanel />
      </section>
      <FocusPanel />
    </main>
  );
}
