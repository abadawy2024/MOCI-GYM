import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addExerciseToDay, deletePlan, removePlanExercise } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function PlanDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const plan = await prisma.workoutPlan.findFirst({
    where: { id: params.id, userId },
    include: {
      days: {
        orderBy: { dayNumber: "asc" },
        include: { exercises: { include: { exercise: true }, orderBy: { order: "asc" } } },
      },
    },
  });

  if (!plan) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{plan.title}</h1>
          {plan.goal && <p className="text-moci-600">{plan.goal}</p>}
          {plan.description && <p className="text-gray-500">{plan.description}</p>}
        </div>
        <div className="flex gap-2">
          <Link href={`/log/new?planId=${plan.id}`} className="btn-primary">Log a session</Link>
          <form action={deletePlan}>
            <input type="hidden" name="planId" value={plan.id} />
            <button className="btn-danger" type="submit">Delete plan</button>
          </form>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {plan.days.map((day) => (
          <div key={day.id} className="card">
            <h2 className="mb-3 font-semibold">{day.label}</h2>

            {day.exercises.length === 0 ? (
              <p className="mb-3 text-sm text-gray-400">No exercises yet.</p>
            ) : (
              <ul className="mb-4 space-y-2">
                {day.exercises.map((pe) => (
                  <li key={pe.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
                    <div>
                      <span className="font-medium">{pe.exercise.name}</span>
                      <span className="ml-2 text-gray-500">
                        {pe.sets && pe.reps
                          ? `${pe.sets} x ${pe.reps}`
                          : pe.durationSeconds
                            ? `${pe.durationSeconds}s`
                            : ""}
                      </span>
                      {pe.notes && <p className="text-gray-400">{pe.notes}</p>}
                    </div>
                    <form action={removePlanExercise}>
                      <input type="hidden" name="planExerciseId" value={pe.id} />
                      <input type="hidden" name="planId" value={plan.id} />
                      <button className="text-xs text-red-500 hover:underline" type="submit">Remove</button>
                    </form>
                  </li>
                ))}
              </ul>
            )}

            <details className="text-sm">
              <summary className="cursor-pointer font-medium text-moci-600">+ Add exercise</summary>
              <form action={addExerciseToDay} className="mt-3 space-y-2">
                <input type="hidden" name="planDayId" value={day.id} />
                <input type="hidden" name="planId" value={plan.id} />
                <input name="exerciseName" required placeholder="Exercise name" className="input" />
                <select name="category" className="input" defaultValue="STRENGTH">
                  <option value="STRENGTH">Strength</option>
                  <option value="CARDIO">Cardio</option>
                  <option value="MOBILITY">Mobility</option>
                  <option value="FUNCTIONAL">Functional</option>
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <input name="sets" type="number" min={1} placeholder="Sets" className="input" />
                  <input name="reps" type="number" min={1} placeholder="Reps" className="input" />
                </div>
                <input name="durationSeconds" type="number" min={1} placeholder="Duration (seconds, for cardio)" className="input" />
                <input name="notes" placeholder="Notes (optional)" className="input" />
                <button type="submit" className="btn-secondary w-full">Add exercise</button>
              </form>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}
