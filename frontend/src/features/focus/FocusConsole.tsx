import { Pause, Play, Square } from "lucide-react";
import { useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { useSessionStore } from "../../store/useSessionStore";

export function FocusConsole() {
  const { activeSessionId, elapsedSeconds, interruptions, tabSwitches, setActiveSession, tick, recordInterruption } =
    useSessionStore();

  useEffect(() => {
    if (!activeSessionId) return;
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [activeSessionId, tick]);

  const minutes = Math.floor(elapsedSeconds / 60).toString().padStart(2, "0");
  const seconds = (elapsedSeconds % 60).toString().padStart(2, "0");

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold">Focus room console</h2>
          <p className="text-sm text-slate-400">Live session integrity and synchronized room state.</p>
        </div>
        <div className="text-4xl font-semibold tabular-nums">{minutes}:{seconds}</div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Button onClick={() => setActiveSession(crypto.randomUUID())}>
          <Play size={16} />
          Start
        </Button>
        <Button variant="secondary" onClick={recordInterruption}>
          <Pause size={16} />
          Interrupt
        </Button>
        <Button variant="ghost" onClick={() => setActiveSession(undefined)}>
          <Square size={16} />
          Complete
        </Button>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-md border border-border p-3">
          <div className="text-slate-400">Status</div>
          <div className="font-medium">{activeSessionId ? "Running" : "Ready"}</div>
        </div>
        <div className="rounded-md border border-border p-3">
          <div className="text-slate-400">Interruptions</div>
          <div className="font-medium">{interruptions}</div>
        </div>
        <div className="rounded-md border border-border p-3">
          <div className="text-slate-400">Tab switches</div>
          <div className="font-medium">{tabSwitches}</div>
        </div>
      </div>
    </Card>
  );
}
