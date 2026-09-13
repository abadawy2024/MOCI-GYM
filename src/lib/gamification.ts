import { prisma } from "@/lib/prisma";

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/**
 * Current streak = consecutive days (ending today or yesterday) with at least one logged activity.
 */
export function calculateStreak(logDates: Date[]): number {
  if (logDates.length === 0) return 0;

  const uniqueDays = Array.from(
    new Set(logDates.map((d) => startOfDay(d).getTime()))
  ).sort((a, b) => b - a);

  const today = startOfDay(new Date()).getTime();
  const mostRecent = uniqueDays[0];

  // Streak is broken if the most recent activity was before yesterday.
  if (today - mostRecent > DAY_MS) return 0;

  let streak = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    const diff = uniqueDays[i - 1] - uniqueDays[i];
    if (diff === DAY_MS) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export const BADGE_DEFINITIONS = [
  {
    code: "first-step",
    name: "First Step",
    description: "Logged your first workout",
    icon: "🥇",
  },
  {
    code: "five-sessions",
    name: "Getting Stronger",
    description: "Logged 5 workout sessions",
    icon: "💪",
  },
  {
    code: "twenty-sessions",
    name: "Gym Regular",
    description: "Logged 20 workout sessions",
    icon: "🏆",
  },
  {
    code: "week-streak",
    name: "7-Day Streak",
    description: "Worked out 7 days in a row",
    icon: "🔥",
  },
  {
    code: "plan-maker",
    name: "Plan Maker",
    description: "Created your first workout plan",
    icon: "📋",
  },
] as const;

export async function evaluateAndAwardBadges(userId: string) {
  const [logCount, logs, planCount] = await Promise.all([
    prisma.workoutLog.count({ where: { userId } }),
    prisma.workoutLog.findMany({ where: { userId }, select: { date: true } }),
    prisma.workoutPlan.count({ where: { userId } }),
  ]);

  const streak = calculateStreak(logs.map((l) => l.date));

  const earnedCodes: string[] = [];
  if (logCount >= 1) earnedCodes.push("first-step");
  if (logCount >= 5) earnedCodes.push("five-sessions");
  if (logCount >= 20) earnedCodes.push("twenty-sessions");
  if (streak >= 7) earnedCodes.push("week-streak");
  if (planCount >= 1) earnedCodes.push("plan-maker");

  if (earnedCodes.length === 0) return;

  const badges = await prisma.badge.findMany({ where: { code: { in: earnedCodes } } });

  for (const badge of badges) {
    await prisma.userBadge.upsert({
      where: { userId_badgeId: { userId, badgeId: badge.id } },
      update: {},
      create: { userId, badgeId: badge.id },
    });
  }
}

export function estimateCalories(type: string, durationMinutes: number): number {
  const perMinute: Record<string, number> = {
    STRENGTH: 6,
    CARDIO: 10,
    CLASS: 8,
    SPORT: 9,
    OTHER: 5,
  };
  return Math.round((perMinute[type] ?? 6) * durationMinutes);
}
