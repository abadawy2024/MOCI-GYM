import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LogForm } from "@/components/LogForm";

export const dynamic = "force-dynamic";

export default async function NewLogPage() {
  const session = await getServerSession(authOptions);
  const plans = await prisma.workoutPlan.findMany({
    where: { userId: session!.user.id },
    select: { id: true, title: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Suspense>
      <LogForm plans={plans} />
    </Suspense>
  );
}
