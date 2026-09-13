import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  STRENGTH: "Strength",
  CARDIO: "Cardio",
  CLASS: "Class",
  SPORT: "Sport",
  OTHER: "Other",
};

function getWeekBuckets(logs: { date: Date; durationMinutes: number }[], weeks = 8) {
  const buckets: { label: string; minutes: number }[] = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  for (let i = weeks - 1; i >= 0; i--) {
    const end = new Date(now);
    end.setDate(end.getDate() - i * 7);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);

    const minutes = logs
      .filter((l) => l.date >= start && l.date <= end)
      .reduce((sum, l) => sum + l.durationMinutes, 0);

    buckets.push({
      label: `${start.getMonth() + 1}/${start.getDate()}`,
      minutes,
    });
  }
  return buckets;
}

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const logs = await prisma.workoutLog.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    include: { plan: { select: { title: true } } },
  });

  const buckets = getWeekBuckets(logs);
  const maxMinutes = Math.max(1, ...buckets.map((b) => b.minutes));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Activity history</h1>
        <p className="text-gray-500">Every logged session, and your weekly training volume.</p>
      </div>

      <div className="card">
        <h2 className="mb-4 font-semibold">Minutes per week</h2>
        <div className="flex items-end gap-3" style={{ height: 140 }}>
          {buckets.map((b) => (
            <div key={b.label} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t bg-moci-500"
                style={{ height: `${Math.max(4, (b.minutes / maxMinutes) * 110)}px` }}
                title={`${b.minutes} minutes`}
              />
              <span className="text-[10px] text-gray-400">{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        {logs.length === 0 ? (
          <p className="text-sm text-gray-500">No activity logged yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-400">
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Type</th>
                <th className="pb-2 font-medium">Plan</th>
                <th className="pb-2 font-medium">Duration</th>
                <th className="pb-2 font-medium">Calories</th>
                <th className="pb-2 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-gray-50">
                  <td className="py-2">{log.date.toLocaleDateString()}</td>
                  <td className="py-2">{TYPE_LABEL[log.type] ?? log.type}</td>
                  <td className="py-2 text-gray-500">{log.plan?.title ?? "-"}</td>
                  <td className="py-2">{log.durationMinutes} min</td>
                  <td className="py-2">{log.caloriesBurned ?? "-"}</td>
                  <td className="py-2 text-gray-500">{log.notes ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
