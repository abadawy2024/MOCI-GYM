import { PrismaClient, EquipmentCategory, ExerciseCategory, ActivityType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { BADGE_DEFINITIONS, evaluateAndAwardBadges } from "../src/lib/gamification";

const prisma = new PrismaClient();

const TEST_PASSWORD = "MociGym@2026";

const TEST_USERS: {
  name: string;
  email: string;
  department: string;
  logsAgoDays: number[]; // days ago (0 = today) to create a sample logged session
}[] = [
  {
    name: "Ahmed Al-Kaabi",
    email: "ahmed.test@moci.gov.qa",
    department: "IT Department",
    logsAgoDays: [0, 1, 2, 3, 4, 6, 8, 11, 14], // active streak + history
  },
  {
    name: "Fatima Al-Sulaiti",
    email: "fatima.test@moci.gov.qa",
    department: "Human Resources",
    logsAgoDays: [0, 2, 5, 9],
  },
  {
    name: "Mohammed Al-Naimi",
    email: "mohammed.test@moci.gov.qa",
    department: "Finance",
    logsAgoDays: [3],
  },
];

const LOG_TYPES: ActivityType[] = ["STRENGTH", "CARDIO", "CLASS", "SPORT"];

const EQUIPMENT: {
  name: string;
  category: EquipmentCategory;
  description: string;
  quantity: number;
}[] = [
  {
    name: "Technogym Skillrun",
    category: "CARDIO",
    description: "Treadmill with slat belt for running, sprinting and sled-push style training.",
    quantity: 3,
  },
  {
    name: "Technogym Excite Run",
    category: "CARDIO",
    description: "Premium treadmill with immersive touchscreen and guided workout programs.",
    quantity: 4,
  },
  {
    name: "Technogym Excite Bike",
    category: "CARDIO",
    description: "Upright cycling bike with adjustable resistance and heart-rate tracking.",
    quantity: 4,
  },
  {
    name: "Technogym Skillrow",
    category: "CARDIO",
    description: "Connected rowing machine that simulates real water rowing dynamics.",
    quantity: 2,
  },
  {
    name: "Technogym Excite Climb",
    category: "CARDIO",
    description: "Stair climber for a high-intensity, low-impact cardio session.",
    quantity: 2,
  },
  {
    name: "Technogym Selection Chest Press",
    category: "STRENGTH",
    description: "Guided chest press machine for safe, controlled upper-body strength work.",
    quantity: 2,
  },
  {
    name: "Technogym Selection Leg Press",
    category: "STRENGTH",
    description: "Seated leg press for building lower-body strength with proper form.",
    quantity: 2,
  },
  {
    name: "Technogym Selection Lat Pulldown",
    category: "STRENGTH",
    description: "Cable machine targeting back and biceps with adjustable resistance.",
    quantity: 2,
  },
  {
    name: "Technogym Kinesis Personal",
    category: "FUNCTIONAL",
    description: "Cable-based functional trainer for full-body, multi-planar movements.",
    quantity: 2,
  },
  {
    name: "Technogym Plurima Free Weights Rack",
    category: "STRENGTH",
    description: "Full rack of dumbbells and barbells for free-weight training.",
    quantity: 1,
  },
  {
    name: "Technogym Pure Strength Line",
    category: "STRENGTH",
    description: "Full circuit of single-station strength machines covering every major muscle group.",
    quantity: 8,
  },
  {
    name: "Technogym Wellness Ball & Mat Area",
    category: "RECOVERY",
    description: "Stretching and mobility zone with stability balls, mats and foam rollers.",
    quantity: 1,
  },
  {
    name: "MYWELLNESS Group Studio",
    category: "GROUP_TRAINING",
    description: "Studio space with Technogym MYWELLNESS-connected equipment for group classes.",
    quantity: 1,
  },
];

const EXERCISES: { name: string; category: ExerciseCategory; muscleGroup?: string }[] = [
  { name: "Chest Press (Technogym Selection)", category: "STRENGTH", muscleGroup: "Chest" },
  { name: "Leg Press (Technogym Selection)", category: "STRENGTH", muscleGroup: "Legs" },
  { name: "Lat Pulldown (Technogym Selection)", category: "STRENGTH", muscleGroup: "Back" },
  { name: "Kinesis Cable Row", category: "FUNCTIONAL", muscleGroup: "Back" },
  { name: "Barbell Squat", category: "STRENGTH", muscleGroup: "Legs" },
  { name: "Dumbbell Shoulder Press", category: "STRENGTH", muscleGroup: "Shoulders" },
  { name: "Treadmill Run (Skillrun)", category: "CARDIO", muscleGroup: "Cardio" },
  { name: "Stationary Bike (Excite Bike)", category: "CARDIO", muscleGroup: "Cardio" },
  { name: "Rowing (Skillrow)", category: "CARDIO", muscleGroup: "Cardio" },
  { name: "Plank", category: "FUNCTIONAL", muscleGroup: "Core" },
  { name: "Mobility & Stretching", category: "MOBILITY", muscleGroup: "Full body" },
];

async function main() {
  console.log("Seeding equipment...");
  for (const eq of EQUIPMENT) {
    const existing = await prisma.equipment.findFirst({ where: { name: eq.name } });
    if (!existing) {
      await prisma.equipment.create({ data: eq });
    }
  }

  console.log("Seeding exercise library...");
  for (const ex of EXERCISES) {
    await prisma.exercise.upsert({
      where: { name: ex.name },
      update: {},
      create: ex,
    });
  }

  console.log("Seeding badges...");
  for (const badge of BADGE_DEFINITIONS) {
    await prisma.badge.upsert({
      where: { code: badge.code },
      update: { name: badge.name, description: badge.description, icon: badge.icon },
      create: badge,
    });
  }

  console.log("Seeding test users...");
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);

  for (const [i, u] of TEST_USERS.entries()) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        department: u.department,
        passwordHash,
      },
    });

    const existingLogs = await prisma.workoutLog.count({ where: { userId: user.id } });
    if (existingLogs === 0) {
      for (const [j, daysAgo] of u.logsAgoDays.entries()) {
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        const type = LOG_TYPES[j % LOG_TYPES.length];
        const durationMinutes = 30 + ((j * 7) % 40);
        await prisma.workoutLog.create({
          data: {
            userId: user.id,
            type,
            date,
            durationMinutes,
            caloriesBurned: durationMinutes * 7,
            notes: j === 0 ? "Great session at the MOCI gym" : undefined,
          },
        });
      }
      await evaluateAndAwardBadges(user.id);
    }

    // Give the first test user a sample plan to demo the Plans feature.
    if (i === 0) {
      const existingPlan = await prisma.workoutPlan.findFirst({ where: { userId: user.id } });
      if (!existingPlan) {
        const chestPress = await prisma.exercise.findUnique({ where: { name: "Chest Press (Technogym Selection)" } });
        const treadmill = await prisma.exercise.findUnique({ where: { name: "Treadmill Run (Skillrun)" } });

        await prisma.workoutPlan.create({
          data: {
            userId: user.id,
            title: "Full Body Foundations",
            goal: "Build strength and endurance",
            description: "A simple two-day split to get started at the MOCI gym.",
            days: {
              create: [
                {
                  dayNumber: 1,
                  label: "Strength Day",
                  exercises: chestPress
                    ? { create: [{ exerciseId: chestPress.id, order: 0, sets: 4, reps: 10 }] }
                    : undefined,
                },
                {
                  dayNumber: 2,
                  label: "Cardio Day",
                  exercises: treadmill
                    ? { create: [{ exerciseId: treadmill.id, order: 0, durationSeconds: 1200 }] }
                    : undefined,
                },
              ],
            },
          },
        });
      }
    }
  }

  console.log("\nTest accounts (all use the same password):");
  console.log(`  Password: ${TEST_PASSWORD}`);
  for (const u of TEST_USERS) {
    console.log(`  - ${u.email}`);
  }

  console.log("\nSeed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
