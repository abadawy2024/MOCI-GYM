"use client";

import { useState } from "react";
import { createPlan } from "@/lib/actions";

export default function NewPlanPage() {
  const [days, setDays] = useState<string[]>(["Day 1"]);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create a workout plan</h1>
        <p className="text-gray-500">Give it a title and split it into training days. You can add exercises next.</p>
      </div>

      <form action={createPlan} className="card space-y-4">
        <div>
          <label className="label" htmlFor="title">Plan title</label>
          <input id="title" name="title" required className="input" placeholder="e.g. Strength Foundations" />
        </div>
        <div>
          <label className="label" htmlFor="goal">Goal (optional)</label>
          <input id="goal" name="goal" className="input" placeholder="e.g. Build strength, lose weight, run 5K" />
        </div>
        <div>
          <label className="label" htmlFor="description">Description (optional)</label>
          <textarea id="description" name="description" className="input" rows={3} />
        </div>

        <div>
          <label className="label">Training days</label>
          <div className="space-y-2">
            {days.map((day, i) => (
              <div key={i} className="flex gap-2">
                <input
                  name="dayLabel"
                  className="input"
                  value={day}
                  onChange={(e) => {
                    const next = [...days];
                    next[i] = e.target.value;
                    setDays(next);
                  }}
                  placeholder={`Day ${i + 1} label, e.g. Push Day`}
                />
                {days.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setDays(days.filter((_, idx) => idx !== i))}
                    className="btn-secondary"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setDays([...days, `Day ${days.length + 1}`])}
            className="btn-secondary mt-2"
          >
            + Add day
          </button>
        </div>

        <button type="submit" className="btn-primary w-full">Create plan</button>
      </form>
    </div>
  );
}
