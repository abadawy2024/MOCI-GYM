import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PlansPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const plans = await prisma.workoutPlan.findMany({
    where: { userId },
    include: { days: { include: { exercises: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Your workout plans</h1>
          <p className="text-gray-500">Structure your training so every gym visit has a purpose.</p>
        </div>
        <Link href="/plans/new" className="btn-primary">+ New plan</Link>
      </div>

      {plans.length === 0 ? (
        <div className="card text-center">
          <p className="text-gray-600">You haven&apos;t created a plan yet.</p>
          <Link href="/plans/new" className="btn-primary mt-4 inline-flex">Create your first plan</Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {plans.map((plan) => (
            <Link key={plan.id} href={`/plans/${plan.id}`} className="card block hover:border-moci-300">
              <h2 className="font-semibold">{plan.title}</h2>
              {plan.goal && <p className="text-sm text-moci-600">{plan.goal}</p>}
              {plan.description && <p className="mt-1 text-sm text-gray-500">{plan.description}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                {plan.days.map((day) => (
                  <span key={day.id} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                    {day.label} &middot; {day.exercises.length} exercises
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
