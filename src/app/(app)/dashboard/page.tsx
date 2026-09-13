import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateStreak, BADGE_DEFINITIONS } from "@/lib/gamification";

export const dynamic = "force-dynamic";

function startOfWeek() {
  const d = new Date();
  const day = d.getDay();
  const diff = (day + 6) % 7; // Monday as start of week
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const [allLogs, recentLogs, userBadges, equipmentHighlights, activePlans] = await Promise.all([
    prisma.workoutLog.findMany({ where: { userId }, select: { date: true } }),
    prisma.workoutLog.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 5,
    }),
    prisma.userBadge.findMany({ where: { userId }, include: { badge: true } }),
    prisma.equipment.findMany({ take: 3 }),
    prisma.workoutPlan.count({ where: { userId } }),
  ]);

  const weekStart = startOfWeek();
  const weekLogs = allLogs.filter((l) => l.date >= weekStart);
  const streak = calculateStreak(allLogs.map((l) => l.date));

  const weekMinutesResult = await prisma.workoutLog.aggregate({
    where: { userId, date: { gte: weekStart } },
    _sum: { durationMinutes: true, caloriesBurned: true },
  });

  const stats = [
    { label: "Current streak", value: `${streak} day${streak === 1 ? "" : "s"}`, icon: "🔥" },
    { label: "Sessions this week", value: weekLogs.length, icon: "📅" },
    { label: "Minutes this week", value: weekMinutesResult._sum.durationMinutes ?? 0, icon: "⏱️" },
    { label: "Calories this week", value: weekMinutesResult._sum.caloriesBurned ?? 0, icon: "🔥" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {session!.user.name?.split(" ")[0]}</h1>
          <p className="text-gray-500">
            The MOCI gym is fully equipped with Technogym machines — here&apos;s your progress.
          </p>
        </div>
        <Link href="/log/new" className="btn-primary">+ Log activity</Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card">
            <div className="text-2xl">{s.icon}</div>
            <div className="mt-2 text-xl font-bold">{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="card md:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Recent activity</h2>
            <Link href="/history" className="text-sm text-moci-600 hover:underline">View all</Link>
          </div>
          {recentLogs.length === 0 ? (
            <p className="text-sm text-gray-500">
              No sessions logged yet.{" "}
              <Link href="/log/new" className="text-moci-600 hover:underline">Log your first workout</Link> to get started.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentLogs.map((log) => (
                <li key={log.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <span className="font-medium">{log.type}</span>
                    <span className="ml-2 text-gray-400">
                      {log.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                    {log.notes && <p className="text-gray-500">{log.notes}</p>}
                  </div>
                  <div className="text-right text-gray-500">
                    <div>{log.durationMinutes} min</div>
                    {log.caloriesBurned != null && <div>{log.caloriesBurned} kcal</div>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h2 className="mb-4 font-semibold">Badges</h2>
          <div className="grid grid-cols-3 gap-3">
            {BADGE_DEFINITIONS.map((def) => {
              const earned = userBadges.some((ub) => ub.badge.code === def.code);
              return (
                <div
                  key={def.code}
                  title={def.description}
                  className={`flex flex-col items-center rounded-lg border p-2 text-center ${
                    earned ? "border-accent-500 bg-accent-500/10" : "border-gray-100 opacity-40"
                  }`}
                >
                  <span className="text-2xl">{def.icon}</span>
                  <span className="mt-1 text-[11px] font-medium leading-tight">{def.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Technogym equipment in your gym</h2>
          <Link href="/equipment" className="text-sm text-moci-600 hover:underline">See full list</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {equipmentHighlights.map((eq) => (
            <div key={eq.id} className="rounded-lg border border-gray-100 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-moci-600">{eq.category.replace("_", " ")}</p>
              <p className="font-medium">{eq.name}</p>
              <p className="text-sm text-gray-500">{eq.description}</p>
            </div>
          ))}
        </div>
      </div>

      {activePlans === 0 && (
        <div className="card border-accent-500/30 bg-accent-500/5">
          <p className="font-medium">You don&apos;t have a workout plan yet.</p>
          <p className="text-sm text-gray-600">
            Build one in a few minutes and know exactly what to do next time you&apos;re at the gym.
          </p>
          <Link href="/plans/new" className="btn-primary mt-3 inline-flex">Create a plan</Link>
        </div>
      )}
    </div>
  );
}
