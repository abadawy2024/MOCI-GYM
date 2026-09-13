# MOCI Gym Tracker

A staff web app for the Ministry of Commerce and Industry (Qatar) gym program. Staff can create
an account, build personal workout plans, log their gym sessions, track streaks and badges, see
a leaderboard, and browse the full list of Technogym equipment available in the on-site gym — the
goal being to motivate employees to actually use it.

## Features

- **Staff accounts** — email/password login (optionally restricted to a work email domain).
- **Workout plans** — staff build multi-day plans and add exercises (sets/reps or duration).
- **Activity logging** — log strength, cardio, class or sport sessions with duration and calories.
- **Dashboard** — weekly stats, current streak, recent activity, badges, and equipment highlights.
- **History** — full activity log with an 8-week training-volume chart.
- **Leaderboard** — most active staff over the last 30 days, to add friendly competition.
- **Equipment showcase** — every Technogym machine in the gym, grouped by category, so staff know
  exactly what's available.
- **Gamification** — automatic badges (first session, 5/20 sessions, 7-day streak, first plan).

## Tech stack

- [Next.js 14](https://nextjs.org/) (App Router, TypeScript, Server Actions)
- [Prisma](https://www.prisma.io/) + PostgreSQL
- [NextAuth.js](https://next-auth.js.org/) (credentials provider, JWT sessions)
- [Tailwind CSS](https://tailwindcss.com/)

Designed to deploy on **Vercel**, backed by a serverless Postgres database (Vercel Postgres or
[Neon](https://neon.tech) both work well).

## Local development

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables** — copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL` — a PostgreSQL connection string (a free [Neon](https://neon.tech) database
     works great for local development).
   - `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`.
   - `NEXTAUTH_URL` — `http://localhost:3000` for local dev.
   - `ALLOWED_EMAIL_DOMAIN` — optional; restricts registration to `@yourdomain` emails.

3. **Push the schema and seed reference data** (exercise library, badges, Technogym equipment,
   and a few test accounts):

   ```bash
   npx prisma db push
   npm run db:seed
   ```

   This also creates three ready-to-use test accounts with sample activity history, a streak,
   badges, and a sample plan already populated — handy for demoing without registering first:

   | Email | Password |
   |---|---|
   | `ahmed.test@moci.gov.qa` | `MociGym@2026` |
   | `fatima.test@moci.gov.qa` | `MociGym@2026` |
   | `mohammed.test@moci.gov.qa` | `MociGym@2026` |

   These are seed data for testing only — change or remove them before handing the app to real
   staff (delete the `TEST_USERS` block in `prisma/seed.ts`, or just delete the accounts from the
   database once real users have registered).

4. **Run the dev server**

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000`, register a staff account, and start logging workouts.

## Deploying to Vercel

1. Push this repository to GitHub (or your Git provider of choice) and import it into
   [Vercel](https://vercel.com/new).
2. Add a Postgres database — either **Vercel Postgres** (Storage tab → Create Database) or an
   external provider like Neon — and copy its connection string.
3. In the Vercel project's **Environment Variables**, set:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (your production URL, e.g. `https://moci-gym.vercel.app`)
   - `ALLOWED_EMAIL_DOMAIN` (optional)
4. Deploy. The `postinstall` script runs `prisma generate` automatically.
5. After the first deploy, run the schema push and seed once against the production database:

   ```bash
   npx prisma db push
   npm run db:seed
   ```

   (Run these locally with `DATABASE_URL` pointed at the production database, or via
   `vercel env pull` first.)

## Project structure

```
prisma/schema.prisma      Database schema (users, plans, exercises, logs, equipment, badges)
prisma/seed.ts            Seeds the exercise library, Technogym equipment list, and badge catalog
src/lib/auth.ts           NextAuth configuration (credentials login)
src/lib/actions.ts        Server Actions: register, create plan, log activity, etc.
src/lib/gamification.ts   Streak calculation and badge-awarding logic
src/app/(app)/...         Authenticated pages: dashboard, plans, log, history, equipment, leaderboard, profile
src/app/login, /register  Public auth pages
src/app/page.tsx          Public landing page
```

## Customizing the equipment list

Edit `prisma/seed.ts` (the `EQUIPMENT` array) with the actual Technogym models installed in the
MOCI gym, then re-run `npm run db:seed`.

## Notes on authentication

This MVP uses simple email/password accounts. If MOCI staff should sign in with their existing
Microsoft 365 / Entra ID accounts instead, swap the credentials provider in `src/lib/auth.ts` for
NextAuth's Azure AD provider — the rest of the app (plans, logging, badges) is unaffected.
