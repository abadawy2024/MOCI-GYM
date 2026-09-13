"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { evaluateAndAwardBadges, estimateCalories } from "@/lib/gamification";
import type { ActivityType, ExerciseCategory } from "@prisma/client";

async function requireUserId(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session.user.id;
}

export type ActionState = { error?: string; success?: boolean };

export async function registerUser(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");
  const department = String(formData.get("department") || "").trim() || null;

  if (!name || !email || !password) {
    return { error: "Please fill in all required fields." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN?.trim();
  if (allowedDomain && !email.endsWith(`@${allowedDomain}`)) {
    return { error: `Please register with your @${allowedDomain} work email.` };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, email, passwordHash, department },
  });

  redirect("/login?registered=1");
}

export async function createPlan(formData: FormData) {
  const userId = await requireUserId();

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const goal = String(formData.get("goal") || "").trim() || null;
  const dayLabels = formData.getAll("dayLabel").map((v) => String(v).trim()).filter(Boolean);

  if (!title || dayLabels.length === 0) {
    throw new Error("A title and at least one training day are required.");
  }

  const plan = await prisma.workoutPlan.create({
    data: {
      userId,
      title,
      description,
      goal,
      days: {
        create: dayLabels.map((label, i) => ({ dayNumber: i + 1, label })),
      },
    },
  });

  await evaluateAndAwardBadges(userId);

  revalidatePath("/plans");
  redirect(`/plans/${plan.id}`);
}

export async function deletePlan(formData: FormData) {
  const userId = await requireUserId();
  const planId = String(formData.get("planId") || "");

  await prisma.workoutPlan.deleteMany({ where: { id: planId, userId } });
  revalidatePath("/plans");
  redirect("/plans");
}

export async function addExerciseToDay(formData: FormData) {
  const userId = await requireUserId();

  const planDayId = String(formData.get("planDayId") || "");
  const planId = String(formData.get("planId") || "");
  const exerciseName = String(formData.get("exerciseName") || "").trim();
  const category = String(formData.get("category") || "STRENGTH") as ExerciseCategory;
  const sets = formData.get("sets") ? Number(formData.get("sets")) : null;
  const reps = formData.get("reps") ? Number(formData.get("reps")) : null;
  const durationSeconds = formData.get("durationSeconds")
    ? Number(formData.get("durationSeconds"))
    : null;
  const notes = String(formData.get("notes") || "").trim() || null;

  if (!planDayId || !exerciseName) {
    throw new Error("Exercise name is required.");
  }

  // Ownership check.
  const day = await prisma.planDay.findFirst({
    where: { id: planDayId, plan: { userId } },
  });
  if (!day) throw new Error("Not found.");

  const exercise = await prisma.exercise.upsert({
    where: { name: exerciseName },
    update: {},
    create: { name: exerciseName, category },
  });

  const count = await prisma.planExercise.count({ where: { planDayId } });

  await prisma.planExercise.create({
    data: {
      planDayId,
      exerciseId: exercise.id,
      order: count,
      sets,
      reps,
      durationSeconds,
      notes,
    },
  });

  revalidatePath(`/plans/${planId}`);
}

export async function removePlanExercise(formData: FormData) {
  const userId = await requireUserId();
  const id = String(formData.get("planExerciseId") || "");
  const planId = String(formData.get("planId") || "");

  await prisma.planExercise.deleteMany({
    where: { id, planDay: { plan: { userId } } },
  });

  revalidatePath(`/plans/${planId}`);
}

export async function logActivity(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const userId = await requireUserId();

  const type = String(formData.get("type") || "OTHER") as ActivityType;
  const durationMinutes = Number(formData.get("durationMinutes") || 0);
  const dateStr = String(formData.get("date") || "");
  const notes = String(formData.get("notes") || "").trim() || null;
  const planId = String(formData.get("planId") || "") || null;
  const planDayId = String(formData.get("planDayId") || "") || null;
  const caloriesInput = formData.get("caloriesBurned");

  if (!durationMinutes || durationMinutes <= 0) {
    return { error: "Please enter a valid duration." };
  }

  const caloriesBurned = caloriesInput && String(caloriesInput).trim() !== ""
    ? Number(caloriesInput)
    : estimateCalories(type, durationMinutes);

  await prisma.workoutLog.create({
    data: {
      userId,
      type,
      durationMinutes,
      caloriesBurned,
      notes,
      date: dateStr ? new Date(dateStr) : new Date(),
      planId: planId || undefined,
      planDayId: planDayId || undefined,
    },
  });

  await evaluateAndAwardBadges(userId);

  revalidatePath("/dashboard");
  revalidatePath("/history");
  revalidatePath("/leaderboard");

  return { success: true };
}

export async function updateProfile(formData: FormData) {
  const userId = await requireUserId();
  const name = String(formData.get("name") || "").trim();
  const department = String(formData.get("department") || "").trim() || null;

  if (!name) throw new Error("Name is required.");

  await prisma.user.update({
    where: { id: userId },
    data: { name, department },
  });

  revalidatePath("/profile");
}
