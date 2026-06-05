import { Github, KeyRound } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";

export function AuthPanel() {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-md bg-primary text-slate-950">
          <KeyRound size={20} />
        </div>
        <div>
          <h2 className="text-base font-semibold">Secure access</h2>
          <p className="text-sm text-slate-400">JWT sessions, refresh rotation, OAuth-ready providers.</p>
        </div>
      </div>
      <div className="grid gap-3">
        <Button>Continue with Google</Button>
        <Button variant="secondary">
          <Github size={16} />
          Continue with GitHub
        </Button>
        <Button variant="ghost">Continue with Apple</Button>
      </div>
    </Card>
  );
}
