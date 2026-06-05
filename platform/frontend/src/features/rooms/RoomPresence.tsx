import { UsersRound } from "lucide-react";
import { Card } from "../../components/ui/card";

const users = ["Mira", "Avery", "Noah", "Lina", "Sam"];

export function RoomPresence() {
  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center gap-2">
        <UsersRound className="text-primary" size={18} />
        <h2 className="text-base font-semibold">Active focus room</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {users.map((user) => (
          <span key={user} className="rounded-md border border-border bg-muted px-3 py-2 text-sm">
            {user}
          </span>
        ))}
      </div>
    </Card>
  );
}
