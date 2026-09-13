import Link from "next/link";

const FEATURES = [
  {
    icon: "📋",
    title: "Personal training plans",
    description: "Build your own multi-day workout plans, or follow ones designed by the wellness team.",
  },
  {
    icon: "📈",
    title: "Log every session",
    description: "Track strength, cardio, classes and sports in seconds and watch your history grow.",
  },
  {
    icon: "🔥",
    title: "Streaks & badges",
    description: "Stay motivated with streak tracking and achievements as you build the habit.",
  },
  {
    icon: "🏋️",
    title: "Technogym equipment guide",
    description: "See exactly what's available in the MOCI gym — every Technogym machine, explained.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-moci-900 via-moci-800 to-moci-900 text-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏛️</span>
          <span className="text-lg font-bold tracking-tight">MOCI Gym Tracker</span>
        </div>
        <nav className="flex gap-3">
          <Link href="/login" className="btn-secondary !border-white/30 !bg-transparent !text-white hover:!bg-white/10">
            Log in
          </Link>
          <Link href="/register" className="btn-primary !bg-accent-500 hover:!bg-accent-600">
            Create account
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-10">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <p className="mb-3 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-moci-100">
              Ministry of Commerce and Industry &middot; Staff Wellness
            </p>
            <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
              Your gym is fully equipped by Technogym.
              <span className="text-accent-500"> Now it&apos;s time to use it.</span>
            </h1>
            <p className="mt-5 text-lg text-moci-100">
              Plan your workouts, log every session, and track your progress — all in one place
              built for MOCI staff. See what equipment is waiting for you downstairs, and let the
              app keep you motivated to come back.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/register" className="btn-primary !bg-accent-500 px-6 py-3 text-base hover:!bg-accent-600">
                Get started — it&apos;s free
              </Link>
              <Link
                href="/login"
                className="btn-secondary !border-white/30 !bg-transparent px-6 py-3 text-base !text-white hover:!bg-white/10"
              >
                I already have an account
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl bg-white/10 p-5 backdrop-blur">
                <div className="text-3xl">{f.icon}</div>
                <h3 className="mt-3 font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-moci-100">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 py-6 text-center text-sm text-moci-100">
        MOCI Staff Gym &middot; Powered by Technogym equipment
      </footer>
    </div>
  );
}
