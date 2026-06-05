import { Trophy } from "lucide-react";
import { Card } from "../../components/ui/card";

const rows = [
  ["1", "Avery Chen", "41.2h", "US"],
  ["2", "Mira Shah", "38.7h", "IN"],
  ["3", "Noah Kim", "35.4h", "KR"],
  ["4", "Lina Weber", "33.9h", "DE"]
];

export function LeaderboardTable() {
  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center gap-2">
        <Trophy className="text-accent" size={18} />
        <h2 className="text-base font-semibold">Global weekly leaderboard</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-left text-sm">
          <thead className="text-slate-400">
            <tr>
              <th className="pb-3">Rank</th>
              <th className="pb-3">User</th>
              <th className="pb-3">Focus</th>
              <th className="pb-3">Country</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]} className="border-t border-border">
                {row.map((cell) => (
                  <td key={cell} className="py-3">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
