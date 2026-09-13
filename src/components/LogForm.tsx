"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import { logActivity, type ActionState } from "@/lib/actions";

type PlanOption = {
  id: string;
  title: string;
};

const initialState: ActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full">
      {pending ? "Saving..." : "Log activity"}
    </button>
  );
}

export function LogForm({ plans }: { plans: PlanOption[] }) {
  const [state, formAction] = useActionState(logActivity, initialState);
  const searchParams = useSearchParams();
  const defaultPlanId = searchParams.get("planId") ?? "";
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Log an activity</h1>
        <p className="text-gray-500">A quick entry keeps your streak alive and your history accurate.</p>
      </div>

      {state?.success && (
        <div className="rounded-lg bg-moci-50 px-3 py-2 text-sm text-moci-700">
          Nice work — activity logged!
        </div>
      )}
      {state?.error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</div>
      )}

      <form action={formAction} className="card space-y-4">
        <div>
          <label className="label" htmlFor="type">Activity type</label>
          <select id="type" name="type" className="input" defaultValue="STRENGTH">
            <option value="STRENGTH">Strength training</option>
            <option value="CARDIO">Cardio</option>
            <option value="CLASS">Group class</option>
            <option value="SPORT">Sport</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        {plans.length > 0 && (
          <div>
            <label className="label" htmlFor="planId">Related plan (optional)</label>
            <select id="planId" name="planId" className="input" defaultValue={defaultPlanId}>
              <option value="">None</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.title}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="durationMinutes">Duration (minutes)</label>
            <input id="durationMinutes" name="durationMinutes" type="number" min={1} required className="input" />
          </div>
          <div>
            <label className="label" htmlFor="caloriesBurned">Calories (optional)</label>
            <input id="caloriesBurned" name="caloriesBurned" type="number" min={0} className="input" />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="date">Date</label>
          <input id="date" name="date" type="date" defaultValue={today} max={today} className="input" />
        </div>

        <div>
          <label className="label" htmlFor="notes">Notes (optional)</label>
          <textarea id="notes" name="notes" rows={2} className="input" placeholder="How did it go?" />
        </div>

        <SubmitButton />
      </form>
    </div>
  );
}
