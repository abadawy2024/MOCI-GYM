import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateStreak } from "@/lib/gamification";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions);
  const currentUserId = session!.user.id;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      department: true,
      logs: { where: { date: { gte: thirtyDaysAgo } }, select: { date: true, durationMinutes: true } },
    },
  });

  const ranked = users
    .map((u) => ({
      id: u.id,
      name: u.name,
      department: u.department,
      sessions: u.logs.length,
      minutes: u.logs.reduce((sum, l) => sum + l.durationMinutes, 0),
      streak: calculateStreak(u.logs.map((l) => l.date)),
    }))
    .filter((u) => u.sessions > 0)
    .sort((a, b) => b.sessions - a.sessions || b.minutes - a.minutes);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <p className="text-gray-500">Most active MOCI staff over the last 30 days. Friendly competition, real results.</p>
      </div>

      <div className="card">
        {ranked.length === 0 ? (
          <p className="text-sm text-gray-500">No activity logged in the last 30 days yet — be the first!</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-400">
                <th className="pb-2 font-medium">#</th>
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Department</th>
                <th className="pb-2 font-medium">Sessions</th>
                <th className="pb-2 font-medium">Minutes</th>
                <th className="pb-2 font-medium">Streak</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((u, i) => (
                <tr
                  key={u.id}
                  className={`border-b border-gray-50 ${u.id === currentUserId ? "bg-moci-50 font-medium" : ""}`}
                >
                  <td className="py-2">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                  </td>
                  <td className="py-2">{u.name}{u.id === currentUserId ? " (you)" : ""}</td>
                  <td className="py-2 text-gray-500">{u.department ?? "-"}</td>
                  <td className="py-2">{u.sessions}</td>
                  <td className="py-2">{u.minutes}</td>
                  <td className="py-2">{u.streak > 0 ? `🔥 ${u.streak}` : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
