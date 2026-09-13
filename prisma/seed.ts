import { PrismaClient, EquipmentCategory, ExerciseCategory } from "@prisma/client";
import { BADGE_DEFINITIONS } from "../src/lib/gamification";

const prisma = new PrismaClient();

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

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
