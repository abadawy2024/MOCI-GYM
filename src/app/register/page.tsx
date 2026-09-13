"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { registerUser, type ActionState } from "@/lib/actions";

const initialState: ActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full">
      {pending ? "Creating account..." : "Create account"}
    </button>
  );
}

export default function RegisterPage() {
  const [state, formAction] = useActionState(registerUser, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Link href="/" className="text-2xl">🏛️</Link>
          <h1 className="mt-2 text-xl font-bold">Join the MOCI Gym program</h1>
          <p className="text-sm text-gray-500">Create your staff account</p>
        </div>

        {state?.error && (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</div>
        )}

        <form action={formAction} className="card space-y-4">
          <div>
            <label className="label" htmlFor="name">Full name</label>
            <input id="name" name="name" required className="input" />
          </div>
          <div>
            <label className="label" htmlFor="email">Work email</label>
            <input id="email" name="email" type="email" required className="input" />
          </div>
          <div>
            <label className="label" htmlFor="department">Department (optional)</label>
            <input id="department" name="department" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              className="input"
            />
            <p className="mt-1 text-xs text-gray-400">At least 8 characters.</p>
          </div>
          <SubmitButton />
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-moci-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
